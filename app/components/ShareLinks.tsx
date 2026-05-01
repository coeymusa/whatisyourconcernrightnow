"use client";

import { useState } from "react";

const SITE_URL = "https://whatisyourconcern.com";
const SHARE_TEXT =
  "what is your concern? an anonymous global record of human fear, on a 3D globe. one voice, one entry, no names.";

const TWEET_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
const BLUESKY_URL = `https://bsky.app/intent/compose?text=${encodeURIComponent(SHARE_TEXT + " " + SITE_URL)}`;
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SITE_URL)}`;
const REDDIT_URL = `https://www.reddit.com/submit?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent("an anonymous global record of human concern, on a 3D globe")}`;
const FACEBOOK_URL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`;
const TELEGRAM_URL = `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`;

type Tone = "dark" | "light";

export default function ShareLinks({ tone = "dark" }: { tone?: Tone }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const isDark = tone === "dark";
  const tile =
    "flex items-center justify-center gap-2 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition border " +
    (isDark
      ? "border-bone/20 bg-ink-soft/60 text-bone/85 hover:border-blood hover:text-blood hover:bg-ink"
      : "border-ink/20 bg-bone text-ink/85 hover:border-blood hover:text-blood");
  const copy =
    "flex items-center justify-between px-3 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition border " +
    (isDark
      ? "border-bone/30 bg-ink/40 text-bone hover:border-blood"
      : "border-ink/30 bg-bone text-ink hover:border-blood");

  function copyLink() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function nativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) {
      copyLink();
      return;
    }
    navigator
      .share({
        title: "what is your concern?",
        text: SHARE_TEXT,
        url: SITE_URL,
      })
      .then(() => {
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <a className={tile} href={TWEET_URL} target="_blank" rel="noopener noreferrer">
          x / twitter →
        </a>
        <a className={tile} href={BLUESKY_URL} target="_blank" rel="noopener noreferrer">
          bluesky →
        </a>
        <a className={tile} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          whatsapp →
        </a>
        <a className={tile} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
          telegram →
        </a>
        <a className={tile} href={REDDIT_URL} target="_blank" rel="noopener noreferrer">
          reddit →
        </a>
        <button className={tile} onClick={nativeShare} type="button">
          {shared ? "✓ shared" : "share…"}
        </button>
      </div>
      <button className={`${copy} w-full`} onClick={copyLink} type="button">
        <span>{copied ? "✓ copied to clipboard" : "or copy the link"}</span>
        <span
          className={
            isDark
              ? copied ? "text-amber" : "text-bone/55"
              : copied ? "text-blood" : "text-ink/55"
          }
        >
          {copied ? "✓" : "↗"}
        </span>
      </button>
    </div>
  );
}
