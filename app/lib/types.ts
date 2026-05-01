export type ConcernCategory =
  | "economy"
  | "climate"
  | "war"
  | "democracy"
  | "health"
  | "ai"
  | "loneliness"
  | "housing"
  | "inequality"
  | "education"
  | "future"
  | "other";

export const CATEGORY_LABELS: Record<ConcernCategory, string> = {
  economy: "Cost of living & economy",
  climate: "Climate & environment",
  war: "War & violence",
  democracy: "Democracy & freedom",
  health: "Health & healthcare",
  ai: "Technology & AI",
  loneliness: "Loneliness & meaning",
  housing: "Housing",
  inequality: "Inequality",
  education: "Education & children",
  future: "The future itself",
  other: "Something else",
};

export const CATEGORY_ORDER: ConcernCategory[] = [
  "economy",
  "climate",
  "war",
  "democracy",
  "health",
  "inequality",
  "ai",
  "housing",
  "loneliness",
  "education",
  "future",
  "other",
];

export type AgeBracket = "13–19" | "20–29" | "30–44" | "45–59" | "60+";

export const AGE_BRACKETS: AgeBracket[] = [
  "13–19",
  "20–29",
  "30–44",
  "45–59",
  "60+",
];

export function ageToBracket(age: number): AgeBracket {
  if (age < 20) return "13–19";
  if (age < 30) return "20–29";
  if (age < 45) return "30–44";
  if (age < 60) return "45–59";
  return "60+";
}

export type Concern = {
  id: string;
  age: number;
  bracket: AgeBracket;
  countryCode: string; // ISO-2
  text: string; // always english, what the UI displays
  category: ConcernCategory;
  ts: number; // unix ms
  // when the original was non-english, keep it for the "see original" affordance
  original?: { lang: string; text: string };
  // vote totals (computed by the public view in Supabase)
  score?: number;
  upvotes?: number;
  downvotes?: number;
};

export type Solution = {
  id: string;
  concernId: string;
  age: number;
  bracket: AgeBracket;
  countryCode: string;
  text: string;
  ts: number;
  original?: { lang: string; text: string };
  score?: number;
  upvotes?: number;
  downvotes?: number;
};
