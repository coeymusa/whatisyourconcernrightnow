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

// Aggregate counts per country/category — used by /world and /topics
// index pages so each entry shows how loud the record is from there.

export async function fetchCountryCounts(): Promise<Map<string, number>> {
  const base = process.env[URL_KEY];
  const k = key();
  const out = new Map<string, number>();
  if (!base || !k) return out;
  // PostgREST: select country_code with no limit, count client-side. We
  // only have ~hundreds of rows total, so this is cheap. Switch to an
  // RPC with GROUP BY if the row count grows past a few thousand.
  const r = await fetch(
    `${base}/rest/v1/concerns_public?select=country_code&limit=5000`,
    {
      headers: headers(k),
      next: { revalidate: 300, tags: ["country-counts"] },
    },
  );
  if (!r.ok) return out;
  const rows = (await r.json()) as Array<{ country_code: string }>;
  for (const row of rows) {
    out.set(row.country_code, (out.get(row.country_code) ?? 0) + 1);
  }
  return out;
}

export async function fetchCategoryCounts(): Promise<Map<string, number>> {
  const base = process.env[URL_KEY];
  const k = key();
  const out = new Map<string, number>();
  if (!base || !k) return out;
  const r = await fetch(
    `${base}/rest/v1/concerns_public?select=category&limit=5000`,
    {
      headers: headers(k),
      next: { revalidate: 300, tags: ["category-counts"] },
    },
  );
  if (!r.ok) return out;
  const rows = (await r.json()) as Array<{ category: string }>;
  for (const row of rows) {
    out.set(row.category, (out.get(row.category) ?? 0) + 1);
  }
  return out;
}

// Single-row read by id, used by /dispatch/[id] permalink pages.
export async function fetchConcernById(id: string): Promise<Row | null> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return null;
  const url = `${base}/rest/v1/concerns_public?select=*&id=eq.${encodeURIComponent(id)}&limit=1`;
  const r = await fetch(url, {
    headers: headers(k),
    next: { revalidate: 600, tags: [`concern:${id}`] },
  });
  if (!r.ok) return null;
  const rows = (await r.json()) as Row[];
  return rows[0] ?? null;
}

// Country-filtered read used by /world/[code] server-rendered pages.
export async function fetchByCountry(
  countryCode: string,
  limit = 60,
): Promise<Row[]> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return [];
  const safeLimit = Math.max(1, Math.min(limit, 200));
  const url =
    `${base}/rest/v1/concerns_public?select=*` +
    `&country_code=eq.${encodeURIComponent(countryCode.toUpperCase())}` +
    `&order=created_at.desc&limit=${safeLimit}`;
  const r = await fetch(url, {
    headers: headers(k),
    // 5-min revalidation — country pages don't need second-level freshness
    next: { revalidate: 300, tags: [`country:${countryCode.toUpperCase()}`] },
  });
  if (!r.ok) return [];
  return (await r.json()) as Row[];
}

// Topic-filtered read used by /topics/[category] server-rendered pages.
export async function fetchByCategory(
  category: string,
  limit = 60,
): Promise<Row[]> {
  const base = process.env[URL_KEY];
  const k = key();
  if (!base || !k) return [];
  const safeLimit = Math.max(1, Math.min(limit, 200));
  const url =
    `${base}/rest/v1/concerns_public?select=*` +
    `&category=eq.${encodeURIComponent(category)}` +
    `&order=created_at.desc&limit=${safeLimit}`;
  const r = await fetch(url, {
    headers: headers(k),
    next: { revalidate: 300, tags: [`topic:${category}`] },
  });
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
