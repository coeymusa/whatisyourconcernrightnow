// Browser-side UX helpers: timezone-based country guess + a tiny preferences store.

import { COUNTRIES } from "./countries";

const TZ_TO_COUNTRY: Record<string, string> = {
  "America/New_York": "US",
  "America/Los_Angeles": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "America/Lima": "PE",
  "America/Caracas": "VE",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Lisbon": "PT",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Zurich": "CH",
  "Europe/Vienna": "AT",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Athens": "GR",
  "Europe/Bucharest": "RO",
  "Europe/Budapest": "HU",
  "Europe/Kyiv": "UA",
  "Europe/Moscow": "RU",
  "Europe/Istanbul": "TR",
  "Europe/Reykjavik": "IS",
  "Europe/Tallinn": "EE",
  "Europe/Vilnius": "LT",
  "Europe/Riga": "LV",
  "Asia/Jerusalem": "IL",
  "Asia/Beirut": "LB",
  "Africa/Cairo": "EG",
  "Asia/Riyadh": "SA",
  "Asia/Dubai": "AE",
  "Asia/Tehran": "IR",
  "Asia/Baghdad": "IQ",
  "Asia/Karachi": "PK",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Taipei": "TW",
  "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Bangkok": "TH",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Singapore": "SG",
  "Asia/Jakarta": "ID",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Addis_Ababa": "ET",
  "Africa/Accra": "GH",
  "Africa/Casablanca": "MA",
  "Africa/Algiers": "DZ",
  "Africa/Tunis": "TN",
};

export function guessCountry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
    // try region-only fallback ("Europe/", "Asia/", ...)
    return null;
  } catch {
    return null;
  }
}

export const PREFS_KEY = "concern.prefs.v1";

export type Prefs = {
  age?: number;
  countryCode?: string;
};

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed) return parsed as Prefs;
  } catch {
    /* ignore */
  }
  return {};
}

export function savePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function isValidCountry(code: string): boolean {
  return COUNTRIES.some((c) => c.code === code);
}
