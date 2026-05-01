import { NextResponse } from "next/server";
import {
  hasSupabase,
  recentVotesByIp,
  upsertConcernVote,
} from "../../../../lib/supabase";
import { hashIp, rateLimitOk } from "../../../../lib/rate-limit";

const VOTE_LIMIT_PER_HOUR = 60;

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const value = (body as { value?: number })?.value;
  if (value !== 1 && value !== -1) {
    return NextResponse.json(
      { error: "value must be 1 or -1" },
      { status: 400 },
    );
  }

  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "voting requires the database — set SUPABASE env vars" },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const ipHash = await hashIp(ip);

  // server-side hourly cap
  if (hasSupabase()) {
    const recent = await recentVotesByIp(ipHash);
    if (recent >= VOTE_LIMIT_PER_HOUR) {
      return NextResponse.json({ error: "too many votes" }, { status: 429 });
    }
  } else if (!rateLimitOk(ipHash, VOTE_LIMIT_PER_HOUR)) {
    return NextResponse.json({ error: "too many votes" }, { status: 429 });
  }

  const ok = await upsertConcernVote({
    concern_id: id,
    ip_hash: ipHash,
    value: value as 1 | -1,
  });

  if (!ok) {
    return NextResponse.json({ error: "vote failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
