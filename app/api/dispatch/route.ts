import { NextResponse } from "next/server";
import { hasSupabase, insertDispatchSubscriber } from "../../lib/supabase";
import { hashIp, rateLimitOk } from "../../lib/rate-limit";

// RFC-5322-ish, intentionally permissive. We're not the mail server — final
// validation is whatever Resend/Buttondown does when we actually try to send.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const email = (body as { email?: unknown })?.email;
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }
  const normalised = email.trim().toLowerCase();

  const ip = clientIp(req);
  const ipHash = await hashIp(ip);
  // 5 subscribe attempts per IP per hour — generous enough for honest people
  // sharing a public IP, tight enough to discourage scripted abuse.
  if (!rateLimitOk(`subscribe:${ipHash}`, 5)) {
    return NextResponse.json({ ok: false, error: "rate limit" }, { status: 429 });
  }

  if (!hasSupabase()) {
    // dev / preview without env: pretend we wrote it. avoids breaking the
    // ui in local development.
    return NextResponse.json({ ok: true });
  }

  const { ok } = await insertDispatchSubscriber({
    email: normalised,
    ip_hash: ipHash,
  });
  if (!ok) {
    return NextResponse.json({ ok: false, error: "write failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
