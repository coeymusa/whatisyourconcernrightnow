# Hacker News submission

The HN audience responds to: a) something built in the open, b) a clear, opinionated framing, c) a personal story behind it. Don't pitch — show.

## Submission title (pick one)

Best on the front page in our judgment, ranked:

1. **Show HN: An anonymous global record of what humanity is afraid of**
2. **Show HN: A 3D globe of one-sentence anonymous concerns**
3. **Show HN: I built a place where you can post one fear, anonymously**

The "Show HN:" prefix and the word "anonymous" both index well. Avoid clickbait or apocalyptic framing — HN downvotes melodrama.

## URL

`https://whatisyourconcern.com`

## First comment (post immediately after submitting — HN expects context from the author)

```
A few notes from the maker:

This is what I've been wondering for a while: what would people say if
they really knew nobody was looking? So I built a place where nobody is.

You post a single sentence about what you're afraid of, with just an
age and a country. No accounts, no usernames, no profiles, no edits,
no deletions. The entry goes on the globe at the country it came from
and stays there.

Some technical notes:

- Next.js 16 (App Router) on Vercel. PostgreSQL via Supabase.
- Equal Earth projection (not Mercator — the Global South should not
  be visually shrunk on a record of human fear).
- One-way hash for rate limiting; not stored against the published
  concern. We cannot work backward from an entry to a contributor.
- Concerns submitted in non-English are translated into English so the
  record is legible globally; the original is preserved.
- No advertisers. No investors. No AI training partner. Funded out
  of pocket.

There are about [N] concerns from [M] countries on the record so far.
Some are political; some are gut-level personal ("I'm tired of being
used"). Both belong.

Curious what HN thinks — about the premise, the moderation policy,
the tech, anything.

— Corey
```

Replace [N] and [M] with the live numbers from `whatisyourconcern.com/api/concerns` (look at `total` and the unique `countryCode` set) right before posting.

## Things that go wrong on HN and how to handle them

- **"This is just a Twitter clone"** — respond once, calmly: it's the
  opposite — we strip identity, prevent edits/deletes, and don't have
  a feed algorithm. Don't argue further.
- **"How do you prevent abuse?"** — point to the moderation section in
  the comment above; don't get into a long back-and-forth.
- **"Why anonymous, isn't accountability good?"** — quote the manifesto
  line: "the entire premise collapses the moment a contributor can be
  identified. If you can be identified, you self-edit."
- **The thread will fill with their own concerns** — that's good. Let
  it. Don't moderate the comments.

## Time of day

Tuesday or Wednesday, 8–10am Pacific. The first hour decides whether
it gets to the front page. Ask one or two people you trust to upvote
the post in the first 30 minutes (NOT a vote ring — just engaged
people who'd actually click through).

## Don't do

- Don't post the same week as a Y Combinator launch wave or a major
  AI launch — your post gets buried.
- Don't reply with an aggressive tone to skeptics; the audience
  judges the maker as much as the work.
- Don't post the link to other places in the same hour — HN's
  algorithm penalizes "ring" behavior.
