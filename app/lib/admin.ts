// Helpers for the admin moderation endpoints. All gated by ADMIN_TOKEN —
// when unset, every admin route returns 503. Authorisation is a constant-time
// equality check on a Bearer token.

export function adminAuthOk(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const presented = auth.slice("Bearer ".length);
  // constant-time-ish — string compare can leak length, but the token is
  // always the same length so length leak is harmless
  if (presented.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ presented.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function patchRow(
  table: "concerns" | "solutions",
  id: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return false;
  const r = await fetch(`${base}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  return r.ok;
}
