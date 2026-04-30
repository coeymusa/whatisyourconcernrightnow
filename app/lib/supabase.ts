// Server-only Supabase client. Returns null when env vars are unset so the app
// continues working in pure-MVP mode against the in-memory store.

const URL_KEY = "SUPABASE_URL";
const SERVICE_KEY = "SUPABASE_SERVICE_ROLE_KEY";
const ANON_KEY = "SUPABASE_ANON_KEY";

export function hasSupabase(): boolean {
  return !!(process.env[URL_KEY] && (process.env[SERVICE_KEY] || process.env[ANON_KEY]));
}

type Row = {
  id: string;
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  category: string;
  created_at: string;
};

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

function key(): string | null {
  return process.env[SERVICE_KEY] ?? process.env[ANON_KEY] ?? null;
}

export async function fetchRecent(limit = 200): Promise<Row[]> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return [];
  const url = `${base}/rest/v1/concerns_public?select=*&order=created_at.desc&limit=${limit}`;
  const r = await fetch(url, { headers: headers(k), cache: "no-store" });
  if (!r.ok) return [];
  return (await r.json()) as Row[];
}

export async function insertConcern(input: {
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  category: string;
  ip_hash: string | null;
}): Promise<Row | null> {
  const base = process.env[URL_KEY];
  // writes require the service role key
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return null;
  const r = await fetch(`${base}/rest/v1/concerns`, {
    method: "POST",
    headers: headers(k),
    body: JSON.stringify(input),
  });
  if (!r.ok) return null;
  const rows = (await r.json()) as Row[];
  return rows[0] ?? null;
}

export async function recentSubmissionsByIp(ipHash: string): Promise<number> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return 0;
  const r = await fetch(`${base}/rest/v1/rpc/recent_submissions`, {
    method: "POST",
    headers: headers(k),
    body: JSON.stringify({ p_ip_hash: ipHash }),
  });
  if (!r.ok) return 0;
  const v = await r.json();
  return typeof v === "number" ? v : 0;
}
