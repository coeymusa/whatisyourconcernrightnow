import type { Concern, ConcernCategory, Solution } from "./types";
import { ageToBracket } from "./types";

type Seed = Omit<Concern, "id" | "ts" | "bracket">;

// Hand-picked seed entries — kept small so the site feels freshly launched.
// Spread across continents, generations, and topics. Originals preserved for
// non-English voices so the global character is visible from day one.
const RAW: Seed[] = [
  // The Americas
  { age: 28, countryCode: "US", text: "I won't be able to afford a child even if I wanted one.", category: "economy" },
  { age: 41, countryCode: "CA", text: "every year fire season starts earlier. we're just getting used to it.", category: "climate" },
  { age: 33, countryCode: "MX", text: "violence and silence. that's the contract here.", category: "war" },
  { age: 30, countryCode: "BR", text: "the rainforest is being sold and we are watching live.", category: "climate" },
  { age: 52, countryCode: "AR", text: "I have stopped trying to understand the currency.", category: "economy" },

  // Europe
  { age: 36, countryCode: "GB", text: "the NHS is dying and we're arguing about flags.", category: "health" },
  { age: 23, countryCode: "GB", text: "rent is 70% of my salary and I'm told I'm lucky.", category: "housing" },
  { age: 21, countryCode: "IE", text: "I won't live in the country I was born in. nobody under 30 will.", category: "housing" },
  { age: 31, countryCode: "FR", text: "democracy looks more and more like theatre.", category: "democracy", original: { lang: "French", text: "la démocratie ressemble de plus en plus à une mise en scène." } },
  { age: 35, countryCode: "ES", text: "we don't make it to the end of the month and nobody on TV is saying it.", category: "economy", original: { lang: "Spanish", text: "no llegamos a fin de mes y nadie habla de eso en la tele." } },
  { age: 39, countryCode: "IT", text: "we are a country of grandparents. and of only children, and sad ones.", category: "loneliness", original: { lang: "Italian", text: "siamo un paese di nonni. e di figli unici e tristi." } },
  { age: 29, countryCode: "NL", text: "my landlord is an algorithm.", category: "housing" },
  { age: 35, countryCode: "FI", text: "I am training my replacement. it doesn't sleep.", category: "ai" },
  { age: 28, countryCode: "UA", text: "I am writing this between sirens. think about that for a second.", category: "war" },
  { age: 42, countryCode: "UA", text: "my son is 18 next year. I can't breathe.", category: "war" },
  { age: 51, countryCode: "RU", text: "we have learned to whisper again.", category: "democracy" },

  // Middle East
  { age: 31, countryCode: "IL", text: "everyone I know has stopped sleeping.", category: "war" },
  { age: 24, countryCode: "PS", text: "I am writing this and I do not know if my street will exist tomorrow.", category: "war" },
  { age: 34, countryCode: "TR", text: "the lira is fiction and we are tired of pretending.", category: "economy" },

  // Asia
  { age: 31, countryCode: "IN", text: "the air in Delhi is no longer breathable in November.", category: "climate" },
  { age: 45, countryCode: "IN", text: "majoritarianism is dressed up as patriotism. it is not.", category: "democracy" },
  { age: 35, countryCode: "IN", text: "my parents trust whatever WhatsApp tells them.", category: "ai" },
  { age: 34, countryCode: "CN", text: "our generation is afraid to have children — and that should worry the world.", category: "economy", original: { lang: "Mandarin", text: "我们这代人不敢生孩子 — and that should worry the world." } },
  { age: 41, countryCode: "JP", text: "loneliness is killing more of us than any disease.", category: "loneliness" },
  { age: 29, countryCode: "JP", text: "the AI talks to me more than my coworkers. I don't think this is a bug.", category: "loneliness" },
  { age: 27, countryCode: "KR", text: "we are too tired to date, marry, or hope.", category: "loneliness" },

  // Oceania / Africa
  { age: 38, countryCode: "AU", text: "another summer of red skies. we keep voting like it's normal.", category: "climate" },
  { age: 31, countryCode: "ZA", text: "I am tired of funerals.", category: "war" },
  { age: 22, countryCode: "NG", text: "japa. we are all leaving. the country is hollowing out.", category: "future" },
  { age: 27, countryCode: "PH", text: "another typhoon. another fundraiser. the cycle is the policy.", category: "climate" },
];

// Deterministic pseudo-random so SSR + client agree (no hydration mismatch).
function det(i: number): number {
  let x = (i * 2654435761) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 0xffffffff;
}

// Anchor seed timestamps to a recent fixed point so they read as "Xh / Xd ago"
// rather than "730d ago". Update this every now and then if the site ages.
// Currently anchored ~3 days before launch (April 2026).
const SEED_ORIGIN = 1745798400000;

export const SEED_CONCERNS: Concern[] = RAW.map((r, i) => ({
  ...r,
  id: `seed-${i}`,
  bracket: ageToBracket(r.age),
  ts: SEED_ORIGIN - Math.floor(det(i) * 1000 * 60 * 60 * 36),
}));

// A small handful of seed responses tied to specific concerns by index.
// Most concerns intentionally have no responses yet — "be the first" is part
// of the offer.
type RawSolution = { concernIndex: number; age: number; countryCode: string; text: string };

const RAW_SOLUTIONS: RawSolution[] = [
  { concernIndex: 0, age: 41, countryCode: "DK", text: "we had two kids on a teacher's salary. it was not the right time. it was never going to be. you start anyway." },
  { concernIndex: 3, age: 42, countryCode: "BR", text: "support indigenous-led land trusts directly. money does what petitions can't." },
  { concernIndex: 4, age: 38, countryCode: "AR", text: "we priced things in dollars. then in eggs. then in coffee. eggs were the most stable. it sounds like a joke. it is also a strategy." },
  { concernIndex: 5, age: 60, countryCode: "GB", text: "every nurse you meet — say thank you out loud. then write your MP. one without the other is decoration." },
  { concernIndex: 6, age: 31, countryCode: "GB", text: "rent strike. it sounds dramatic. it is also the only thing landlords actually fear." },
  { concernIndex: 9, age: 38, countryCode: "ES", text: "cooperative grocery, neighborhood swap. we all stopped going to the supermarket. it works." },
  { concernIndex: 14, age: 55, countryCode: "PL", text: "writing it down counts. we are reading it. you are not invisible." },
  { concernIndex: 16, age: 55, countryCode: "JO", text: "talk to one person who is on the other side every week. it costs nothing and changes everything." },
  { concernIndex: 17, age: 33, countryCode: "EG", text: "we are reading. you are not invisible." },
  { concernIndex: 21, age: 44, countryCode: "IN", text: "subscribe to one newspaper that disagrees with your father. read the headlines aloud at dinner." },
  { concernIndex: 23, age: 52, countryCode: "JP", text: "leave the apps for a month. ride a bus. talk to one stranger a day. it is brutally simple and it works." },
  { concernIndex: 28, age: 24, countryCode: "NG", text: "if you're staying — find five other stayers. that's the country." },
];

export const SEED_SOLUTIONS: Solution[] = RAW_SOLUTIONS.map((s, i) => ({
  id: `sol-seed-${i}`,
  concernId: `seed-${s.concernIndex}`,
  age: s.age,
  bracket: ageToBracket(s.age),
  countryCode: s.countryCode,
  text: s.text,
  ts: SEED_ORIGIN - Math.floor(det(1000 + i) * 1000 * 60 * 60 * 30),
}));

// Smaller pool of ambient fragments — just enough to give the wire some pulse.
// Slow cadence in the store keeps the page from feeling fake.
export const STREAM_FRAGMENTS: Array<Omit<Seed, "category"> & { category: ConcernCategory }> = [
  { age: 24, countryCode: "US", text: "the news is louder than my own thoughts.", category: "loneliness" },
  { age: 35, countryCode: "DE", text: "I miss being bored.", category: "loneliness" },
  { age: 22, countryCode: "FR", text: "we keep marching. nothing keeps changing.", category: "democracy" },
  { age: 26, countryCode: "JP", text: "everyone is online. nobody is reachable.", category: "loneliness" },
  { age: 37, countryCode: "ZA", text: "we joke about loadshedding. we are not laughing.", category: "economy" },
  { age: 33, countryCode: "IT", text: "I am 33 and I live with my mother.", category: "economy" },
  { age: 27, countryCode: "PL", text: "the air sirens are a sound I now know.", category: "war" },
  { age: 34, countryCode: "VN", text: "the river tastes different than it did.", category: "climate" },
  { age: 21, countryCode: "PH", text: "I worry about my mother during typhoons.", category: "climate" },
  { age: 18, countryCode: "NG", text: "I have already applied for three visas.", category: "future" },
];
