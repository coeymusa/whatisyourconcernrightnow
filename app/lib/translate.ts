// Server-side translation via Claude. No-op when ANTHROPIC_API_KEY is unset.
// Uses Haiku 4.5 (cheap + fast) and returns English + the original when input
// was non-English. Failures fall back to passing the input through unchanged.

const SYSTEM = `You translate concerns and solutions submitted to a global anonymous record.
The user-supplied text may be in any language. Detect the language.

If the text is in English, respond with JSON:
{"lang":"English","english":"<the input text verbatim>"}

If the text is NOT in English, translate it faithfully to English (preserve tone,
brevity, lowercase style, punctuation feel, idioms where reasonable, even profanity)
and respond with JSON:
{"lang":"<Language Name>","english":"<your translation>"}

Output ONLY the JSON. No prose, no markdown fences. No explanations.`;

const ENDPOINT = "https://api.anthropic.com/v1/messages";

export type TranslateResult = {
  english: string;
  original?: { lang: string; text: string };
};

export async function translateIfNeeded(text: string): Promise<TranslateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !text || text.length < 2) return { english: text };

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        // System prompt array form so we can attach cache_control;
        // the system prompt is identical across calls so prompt caching saves tokens.
        system: [
          {
            type: "text",
            text: SYSTEM,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!r.ok) return { english: text };
    const data = (await r.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const block = data.content?.find((b) => b.type === "text");
    const raw = block?.text;
    if (!raw) return { english: text };

    const parsed = JSON.parse(raw) as { lang?: string; english?: string };
    if (!parsed.english || typeof parsed.english !== "string") {
      return { english: text };
    }
    if (!parsed.lang || parsed.lang.toLowerCase() === "english") {
      return { english: parsed.english };
    }
    return {
      english: parsed.english,
      original: { lang: parsed.lang, text },
    };
  } catch {
    return { english: text };
  }
}
