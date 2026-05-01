# Launch checklist

Run through this in the hour before posting anywhere. The site is ready to receive traffic — these steps are about not leaving cheap wins on the table.

## 30 minutes before

- [ ] **Submit `/sitemap.xml` to Google Search Console.**
  Go to https://search.google.com/search-console → property `whatisyourconcern.com` → Sitemaps → submit `https://whatisyourconcern.com/sitemap.xml`. If the property doesn't exist yet, add it (DNS verification is fastest via your domain registrar).

- [ ] **Submit to Bing Webmaster Tools.**
  https://www.bing.com/webmasters — paste sitemap URL.

- [ ] **Test the OG card preview.**
  Twitter: https://x.com/intent/tweet?text=test&url=https://whatisyourconcern.com — look at the preview pane.
  Bluesky: paste the URL into compose, wait for the card.
  Discord: paste in any DM, see the embed.
  If any of these look broken or use the wrong text, the OG meta on the homepage is wrong — fix before launching.

- [ ] **Test a dispatch permalink card.**
  Pick a real entry from `https://whatisyourconcern.com/api/concerns` and paste `https://whatisyourconcern.com/dispatch/<id>` into Twitter compose. Verify the quote shows on the card.

- [ ] **Verify Vercel Analytics is recording.**
  Open the Vercel dashboard for `whatisyourconcern.com` → Analytics tab → confirm today shows visits. If not, troubleshoot before launching.

- [ ] **Open the homepage on a real phone.**
  Not a desktop emulator. Submit a test concern. See the post-submit share moment. Click through. Make sure nothing's broken.

## 15 minutes before

- [ ] **Take a fresh screenshot of the globe** at desktop resolution. You may need it for an X / Bluesky reply later when someone asks "what does it look like?"

- [ ] **Pull live numbers.**
  `curl -s https://whatisyourconcern.com/api/concerns | jq '.total'` and a unique-country count. Drop them into the HN first-comment template (`PRESS/HACKER_NEWS.md`) and the Bluesky/X thread template (`PRESS/LAUNCH_THREAD.md`).

- [ ] **Pick three quotable real dispatches** for the launch thread. Pull from the API, look for:
  - Short (under 25 words)
  - First-person voice
  - From three different continents

- [ ] **Pre-stage your reply.**
  When the first "is this real?" or "how do you handle abuse?" comment arrives, you want to reply within 5 minutes. Drafted replies in `PRESS/HACKER_NEWS.md`.

## At launch

- [ ] Post to ONE platform first. Pick the highest-conviction venue (HN, Bluesky, X, or r/InternetIsBeautiful). See what hits. Don't fan out.

- [ ] Stay on the post for 90 minutes. Reply quickly (within 5 minutes) to top comments.

- [ ] Don't share the link in private DMs to seed votes — both HN and Reddit detect this and de-rank.

## After launch (first 6 hours)

- [ ] Watch Vercel Analytics for traffic spikes. If you cross 200 visitors in a 5-minute window:
  - Vercel should auto-scale. No action needed.
  - Submission rate may surge — eyeball `/api/concerns` total to see growth.
  - Watch for any 5xx in the Vercel function logs.

- [ ] If a quote starts going viral on its own (single dispatch URL gets shared a lot), watch which one. That tells you what voice the audience picks up. Useful signal for future framings.

## After launch (next 7 days)

- [ ] Post to the next venue, only after the first one settles. Don't fan out on day one.
- [ ] If anyone in tech press DMs you (Verge, The Atlantic, Axios), reply within 4 hours with a one-line answer + an offer to talk.
- [ ] Watch `/api/concerns` total. If submissions plateau at <2x baseline a week after launch, the site needs a new angle to keep getting attention — not just the original story.

## Things that go wrong, and what to do

- **Site goes down (502/504 in Vercel logs)**
  Likely Supabase rate limit or connection pool. Check Supabase dashboard. The ISR cache means stale pages keep serving.

- **Submission rate triggers Cloudflare/abuse bot detection**
  In `app/lib/turnstile.ts` you have Turnstile wired. If submissions get hard, raise the difficulty.

- **One dispatch goes viral and turns into a target**
  You can hide it via `/api/admin/concerns/[id]/hide` — see admin lib. Don't delete; the project promises permanence.

- **A journalist asks "who built it?"**
  Refer them to `coreymusa.com`. Reply within an hour.
