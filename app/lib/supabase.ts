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
  original_lang?: string | null;
  original_text?: string | null;
  category: string;
  created_at: string;
  score?: number;
  upvotes?: number;
  downvotes?: number;
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

export async function fetchRecent(
  limit = 200,
  sinceMs = 0,
  beforeMs = 0,
): Promise<Row[]> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return [];
  const safeLimit = Math.max(1, Math.min(limit, 500));
  let url = `${base}/rest/v1/concerns_public?select=*&order=created_at.desc&limit=${safeLimit}`;
  if (sinceMs > 0) {
    url += `&created_at=gt.${encodeURIComponent(new Date(sinceMs).toISOString())}`;
  }
  if (beforeMs > 0) {
    url += `&created_at=lt.${encodeURIComponent(new Date(beforeMs).toISOString())}`;
  }
  const r = await fetch(url, { headers: headers(k), cache: "no-store" });
  if (!r.ok) return [];
  return (await r.json()) as Row[];
}

export async function insertConcern(input: {
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  original_lang?: string | null;
  original_text?: string | null;
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

// --- Dispatch (newsletter) subscribers -------------------------------------
//
// Decoupled from voices/voters so an email is never linked to anything posted.
export async function insertDispatchSubscriber(input: {
  email: string;
  ip_hash: string | null;
}): Promise<{ ok: boolean; alreadySubscribed?: boolean }> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return { ok: false };
  const r = await fetch(`${base}/rest/v1/dispatch_subscribers`, {
    method: "POST",
    headers: {
      ...headers(k),
      // upsert-style: the unique index on email makes duplicate inserts a
      // no-op, which lets us return success without leaking who's subscribed
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(input),
  });
  return { ok: r.ok };
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

// --- Solutions ---------------------------------------------------------------
type SolRow = {
  id: string;
  concern_id: string;
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  original_lang?: string | null;
  original_text?: string | null;
  created_at: string;
  score?: number;
  upvotes?: number;
  downvotes?: number;
};

// Upsert (concern_id, ip_hash) → value, replaces existing vote if present.
export async function upsertConcernVote(input: {
  concern_id: string;
  ip_hash: string;
  value: 1 | -1;
}): Promise<boolean> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return false;
  const r = await fetch(
    `${base}/rest/v1/concern_votes?on_conflict=concern_id,ip_hash`,
    {
      method: "POST",
      headers: {
        ...headers(k),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(input),
    },
  );
  return r.ok;
}

export async function upsertSolutionVote(input: {
  solution_id: string;
  ip_hash: string;
  value: 1 | -1;
}): Promise<boolean> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return false;
  const r = await fetch(
    `${base}/rest/v1/solution_votes?on_conflict=solution_id,ip_hash`,
    {
      method: "POST",
      headers: {
        ...headers(k),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(input),
    },
  );
  return r.ok;
}

export async function recentVotesByIp(ipHash: string): Promise<number> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return 0;
  const r = await fetch(`${base}/rest/v1/rpc/recent_votes_for_ip`, {
    method: "POST",
    headers: headers(k),
    body: JSON.stringify({ p_ip_hash: ipHash }),
  });
  if (!r.ok) return 0;
  const v = await r.json();
  return typeof v === "number" ? v : 0;
}

export async function fetchSolutions(
  limit = 200,
  sinceMs = 0,
  beforeMs = 0,
): Promise<SolRow[]> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return [];
  const safeLimit = Math.max(1, Math.min(limit, 500));
  let url = `${base}/rest/v1/solutions_public?select=*&order=created_at.desc&limit=${safeLimit}`;
  if (sinceMs > 0) {
    url += `&created_at=gt.${encodeURIComponent(new Date(sinceMs).toISOString())}`;
  }
  if (beforeMs > 0) {
    url += `&created_at=lt.${encodeURIComponent(new Date(beforeMs).toISOString())}`;
  }
  const r = await fetch(url, { headers: headers(k), cache: "no-store" });
  if (!r.ok) return [];
  return (await r.json()) as SolRow[];
}

export async function insertSolution(input: {
  concern_id: string;
  age: number;
  bracket: string;
  country_code: string;
  text: string;
  original_lang?: string | null;
  original_text?: string | null;
  ip_hash: string | null;
}): Promise<SolRow | null> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return null;
  const r = await fetch(`${base}/rest/v1/solutions`, {
    method: "POST",
    headers: headers(k),
    body: JSON.stringify(input),
  });
  if (!r.ok) return null;
  const rows = (await r.json()) as SolRow[];
  return rows[0] ?? null;
}

export async function recentSolutionsByIp(ipHash: string): Promise<number> {
  const base = process.env[URL_KEY];
  const k = process.env[SERVICE_KEY];
  if (!base || !k) return 0;
  const r = await fetch(`${base}/rest/v1/rpc/recent_solutions`, {
    method: "POST",
    headers: headers(k),
    body: JSON.stringify({ p_ip_hash: ipHash }),
  });
  if (!r.ok) return 0;
  const v = await r.json();
  return typeof v === "number" ? v : 0;
}
