import { NextResponse } from "next/server";
import { COUNTRIES } from "../../../lib/countries";
import { fetchRecent, hasSupabase } from "../../../lib/supabase";
import { CATEGORY_ORDER } from "../../../lib/types";

// IndexNow cron — submits the site's URLs to Bing/Yandex/DDG/Naver/Seznam
// so newly posted concerns get indexed in minutes instead of days.
//
// Setup:
//   - key file lives at /public/<KEY>.txt (Bing fetches this to verify ownership)
//   - Vercel cron in vercel.json calls this once a day with the CRON_SECRET
//
// Manual trigger for backfill: curl with ?force=<CRON_SECRET>

const KEY = "de4dd844fe6e465cbcc49d136d959cb4";
const SITE = "https://whatisyourconcern.com";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const ok =
    auth === `Bearer ${process.env.CRON_SECRET}` ||
    new URL(req.url).searchParams.get("force") === process.env.CRON_SECRET;
  if (!ok && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // top of the URL list — surface pages that should always be re-pinged.
  const urls: string[] = [
    `${SITE}/`,
    `${SITE}/world`,
    `${SITE}/topics`,
    `${SITE}/featured`,
  ];

  // every country index page — 186 of them, all crawl targets.
  for (const c of COUNTRIES) {
    urls.push(`${SITE}/world/${c.code.toLowerCase()}`);
  }

  // every topic index page — 12 of them.
  for (const slug of CATEGORY_ORDER) {
    urls.push(`${SITE}/topics/${slug}`);
  }

  // every concern permalink we know about — IndexNow has a 10k batch cap so
  // 500 dispatch URLs + ~200 index URLs is comfortable.
  if (hasSupabase()) {
    try {
      const rows = await fetchRecent(500, 0, 0);
      for (const r of rows) {
        urls.push(`${SITE}/dispatch/${r.id}`);
      }
    } catch {
      /* swallow — partial submission is better than none */
    }
  }

  const body = {
    host: "whatisyourconcern.com",
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  };

  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  return NextResponse.json({
    ok: r.ok,
    status: r.status,
    pushed: urls.length,
    timestamp: new Date().toISOString(),
  });
}
