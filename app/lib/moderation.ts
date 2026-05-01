// Lightweight moderation: reject submissions that smell like ads, link spam,
// or attempts to drive traffic. Conservative — if a real concern happens to
// trip a false positive, the user can rephrase.

const URL_RE = /(https?:\/\/|\bwww\.[a-z0-9-]|\b[a-z][a-z0-9-]*\.(com|net|org|io|co|app|dev|me|info|biz|gg|tv|us|uk|fr|de|ru|cn|jp|br|in|au|nl|ca|es|it|pt|pl|tr|gr|cz|ie|fi|no|se|dk|ar|cl|mx|kr|tw|sg|hk|za|eg|ng|ph|th|vn|id|my|nz|ai|xyz|to|ly|sh|so|cc|st|fm)\b)/i;

const HANDLE_RE = /(?:^|\s)@[a-z0-9_.-]{3,}/i; // @username spam

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function moderate(text: string): ModerationResult {
  if (URL_RE.test(text)) {
    return { ok: false, reason: "no website links — write the thought, not a URL" };
  }
  if (HANDLE_RE.test(text)) {
    return { ok: false, reason: "no @handles — keep it anonymous and self-contained" };
  }
  return { ok: true };
}
