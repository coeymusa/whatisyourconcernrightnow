import { NextResponse } from "next/server";
import { ageToBracket, type Solution } from "../../lib/types";
import { findCountry } from "../../lib/countries";
import { SEED_SOLUTIONS } from "../../lib/seed";
import {
  fetchSolutions,
  hasSupabase,
  insertSolution,
  recentSolutionsByIp,
} from "../../lib/supabase";
import { hashIp, rateLimitOk } from "../../lib/rate-limit";
import { verifyTurnstile } from "../../lib/turnstile";
import { translateIfNeeded } from "../../lib/translate";
import { moderate } from "../../lib/moderation";

const STORE: Solution[] = [...SEED_SOLUTIONS];

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}

const PUBLIC_CACHE = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const since = Number(params.get("since") ?? "0");
  const before = Number(params.get("before") ?? "0");
  const limit = Number(params.get("limit") ?? "200");
  if (hasSupabase()) {
    const rows = await fetchSolutions(
      Number.isFinite(limit) ? limit : 200,
      Number.isFinite(since) ? since : 0,
      Number.isFinite(before) ? before : 0,
    );
    const items: Solution[] = rows.map((r) => ({
      id: r.id,
      concernId: r.concern_id,
      age: r.age,
      bracket: r.bracket as Solution["bracket"],
      countryCode: r.country_code,
      text: r.text,
      ts: new Date(r.created_at).getTime(),
      ...(r.original_lang && r.original_text
        ? { original: { lang: r.original_lang, text: r.original_text } }
        : {}),
    }));
    return NextResponse.json({ total: items.length, solutions: items }, { headers: PUBLIC_CACHE });
  }
  const slice = since > 0
    ? STORE.filter((s) => s.ts > since)
    : STORE.slice(-200);
  return NextResponse.json({ total: slice.length, solutions: slice }, { headers: PUBLIC_CACHE });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as Partial<{
    concernId: string;
    age: number;
    countryCode: string;
    text: string;
    turnstileToken: string;
  }>;

  const concernId = (b.concernId ?? "").toString();
  const age = Number(b.age);
  const text = (b.text ?? "").toString().trim();
  const country = (b.countryCode ?? "").toString().toUpperCase();

  if (!concernId) {
    return NextResponse.json({ error: "missing concernId" }, { status: 400 });
  }
  if (!Number.isFinite(age) || age < 13 || age > 120) {
    return NextResponse.json({ error: "age out of range" }, { status: 400 });
  }
  if (!findCountry(country)) {
    return NextResponse.json({ error: "unknown country" }, { status: 400 });
  }
  if (text.length < 4 || text.length > 280) {
    return NextResponse.json({ error: "text length" }, { status: 400 });
  }

  const mod = moderate(text);
  if (mod.kind === "block") {
    return NextResponse.json({ error: mod.reason }, { status: 400 });
  }
  if (mod.kind === "shadowban") {
    // fake success, never persist
    return NextResponse.json({
      ok: true,
      solution: {
        id: `ghost-sol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        concernId,
        age,
        bracket: ageToBracket(age),
        countryCode: country,
        text,
        ts: Date.now(),
      },
    });
  }

  const ip = clientIp(req);
  const ok = await verifyTurnstile(b.turnstileToken, ip);
  if (!ok) return NextResponse.json({ error: "challenge failed" }, { status: 403 });

  const ipHash = await hashIp(ip);
  if (hasSupabase()) {
    const recent = await recentSolutionsByIp(ipHash);
    if (recent >= 8) return NextResponse.json({ error: "slow down" }, { status: 429 });
  } else if (!rateLimitOk(ipHash, 10)) {
    return NextResponse.json({ error: "slow down" }, { status: 429 });
  }

  const bracket = ageToBracket(age);

  const t = await translateIfNeeded(text);
  const englishText = t.english;
  const original = t.original;

  if (hasSupabase()) {
    const row = await insertSolution({
      concern_id: concernId,
      age,
      bracket,
      country_code: country,
      text: englishText,
      original_lang: original?.lang ?? null,
      original_text: original?.text ?? null,
      ip_hash: ipHash,
    });
    if (!row) {
      return NextResponse.json({ error: "persistence failed" }, { status: 500 });
    }
    const sol: Solution = {
      id: row.id,
      concernId: row.concern_id,
      age: row.age,
      bracket: row.bracket as Solution["bracket"],
      countryCode: row.country_code,
      text: row.text,
      ts: new Date(row.created_at).getTime(),
      ...(row.original_lang && row.original_text
        ? { original: { lang: row.original_lang, text: row.original_text } }
        : {}),
    };
    return NextResponse.json({ ok: true, solution: sol });
  }

  const sol: Solution = {
    id: `srv-sol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    concernId,
    age,
    bracket,
    countryCode: country,
    text: englishText,
    ts: Date.now(),
    ...(original ? { original } : {}),
  };
  STORE.push(sol);
  return NextResponse.json({ ok: true, solution: sol, total: STORE.length });
}
