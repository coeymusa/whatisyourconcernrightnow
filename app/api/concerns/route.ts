import { NextResponse } from "next/server";
import { SEED_CONCERNS } from "../../lib/seed";
import { ageToBracket, type Concern, type ConcernCategory } from "../../lib/types";
import { findCountry } from "../../lib/countries";
import {
  fetchRecent,
  hasSupabase,
  insertConcern,
  recentSubmissionsByIp,
} from "../../lib/supabase";
import { hashIp, rateLimitOk } from "../../lib/rate-limit";
import { verifyTurnstile } from "../../lib/turnstile";

// In-memory fallback: lives for the lifetime of the server process.
const STORE: Concern[] = [...SEED_CONCERNS];

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}

export async function GET() {
  if (hasSupabase()) {
    const rows = await fetchRecent(200);
    const concerns: Concern[] = rows.map((r) => ({
      id: r.id,
      age: r.age,
      bracket: r.bracket as Concern["bracket"],
      countryCode: r.country_code,
      text: r.text,
      category: r.category as ConcernCategory,
      ts: new Date(r.created_at).getTime(),
    }));
    return NextResponse.json({ total: concerns.length, concerns });
  }
  return NextResponse.json({
    total: STORE.length,
    concerns: STORE.slice(-200),
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as Partial<{
    age: number;
    countryCode: string;
    text: string;
    category: ConcernCategory;
    turnstileToken: string;
  }>;

  const age = Number(b.age);
  const text = (b.text ?? "").toString().trim();
  const country = (b.countryCode ?? "").toString().toUpperCase();
  const category = (b.category ?? "other") as ConcernCategory;

  if (!Number.isFinite(age) || age < 13 || age > 120) {
    return NextResponse.json({ error: "age out of range" }, { status: 400 });
  }
  if (!findCountry(country)) {
    return NextResponse.json({ error: "unknown country" }, { status: 400 });
  }
  if (text.length < 4 || text.length > 240) {
    return NextResponse.json({ error: "text length" }, { status: 400 });
  }

  const ip = clientIp(req);

  // 1. Turnstile (if enabled)
  const ok = await verifyTurnstile(b.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json({ error: "challenge failed" }, { status: 403 });
  }

  // 2. Rate limit — Supabase if available, otherwise in-memory
  const ipHash = await hashIp(ip);
  if (hasSupabase()) {
    const recent = await recentSubmissionsByIp(ipHash);
    if (recent >= 5) {
      return NextResponse.json({ error: "slow down" }, { status: 429 });
    }
  } else if (!rateLimitOk(ipHash)) {
    return NextResponse.json({ error: "slow down" }, { status: 429 });
  }

  const bracket = ageToBracket(age);

  // 3. Persist
  if (hasSupabase()) {
    const row = await insertConcern({
      age,
      bracket,
      country_code: country,
      text,
      category,
      ip_hash: ipHash,
    });
    if (!row) {
      return NextResponse.json({ error: "persistence failed" }, { status: 500 });
    }
    const concern: Concern = {
      id: row.id,
      age: row.age,
      bracket: row.bracket as Concern["bracket"],
      countryCode: row.country_code,
      text: row.text,
      category: row.category as ConcernCategory,
      ts: new Date(row.created_at).getTime(),
    };
    return NextResponse.json({ ok: true, concern });
  }

  const concern: Concern = {
    id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    age,
    bracket,
    countryCode: country,
    text,
    category,
    ts: Date.now(),
  };
  STORE.push(concern);
  return NextResponse.json({ ok: true, concern, total: STORE.length });
}
