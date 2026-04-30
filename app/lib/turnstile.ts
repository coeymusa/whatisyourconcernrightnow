// Server-side Cloudflare Turnstile verification. No-op when TURNSTILE_SECRET is unset.
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // shield disabled in dev / when not configured
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!r.ok) return false;
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
