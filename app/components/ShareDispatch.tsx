"use client";

import { useState } from "react";

type Props = {
  url: string;
  text: string; // the dispatch quote, used for share text
};

// Lightweight share row for /dispatch/[id]. Web Share API where available
// (mobile + Safari + Edge), explicit Twitter/Bluesky/copy fallback otherwise.
export default function ShareDispatch({ url, text }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `"${text}"`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(url)}`;
  const bskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(
    `${shareText} ${url}`,
  )}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const onNative = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ url, text: shareText });
        return;
      } catch {
        /* user dismissed */
      }
    }
    onCopy();
  };

  return (
    <div className="mt-12 border-t border-ink/15 pt-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55">
        § share — pass it along
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em]">
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-baseline gap-2 text-ink/75 hover:text-ink"
        >
          <span>x / twitter</span>
          <span className="text-blood">→</span>
        </a>
        <a
          href={bskyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-baseline gap-2 text-ink/75 hover:text-ink"
        >
          <span>bluesky</span>
          <span className="text-blood">→</span>
        </a>
        <button
          onClick={onCopy}
          className="group inline-flex items-baseline gap-2 text-ink/75 hover:text-ink"
        >
          <span>{copied ? "link copied" : "copy link"}</span>
          <span className="text-blood">→</span>
        </button>
        <button
          onClick={onNative}
          className="group inline-flex items-baseline gap-2 text-ink/75 hover:text-ink sm:hidden"
        >
          <span>share…</span>
          <span className="text-blood">→</span>
        </button>
      </div>
    </div>
  );
}
