"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
};

export default function TurnstileWidget({ siteKey, onToken }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    let cancelled = false;
    function mount() {
      if (cancelled || !ref.current || !window.turnstile) return;
      idRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onToken,
        theme: "light",
        size: "flexible",
        appearance: "interaction-only",
      });
    }

    if (window.turnstile) {
      mount();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-turnstile="1"]',
      );
      if (existing) {
        existing.addEventListener("load", mount);
      } else {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        s.dataset.turnstile = "1";
        s.addEventListener("load", mount);
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      if (idRef.current && window.turnstile) {
        try {
          window.turnstile.remove(idRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [siteKey, onToken]);

  return <div ref={ref} className="mt-4 min-h-[1.5rem]" />;
}
