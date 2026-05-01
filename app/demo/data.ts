import type { Concern, Solution } from "../lib/types";
import { ageToBracket } from "../lib/types";

// curated set for /demo screen-recording. these are real voices pulled from
// the live record, hand-picked for emotional weight + geographic spread.
// timestamps are computed at module-load so they always look "recent".
//
// keep this list small (≤16) so the bubble cycler rotates through them
// quickly on camera. if you want more dots on the planet, add countries
// that aren't on the read-aloud list.

const NOW = Date.now();
const m = (mins: number) => NOW - mins * 60_000;

type Seed = Omit<Concern, "bracket">;

const SEEDS: Seed[] = [
  // headline voices — these are what get read in the script
  {
    id: "demo-fi-24",
    age: 24,
    countryCode: "FI",
    text: "My glass is empty but I don't want to get up to refill it.",
    category: "loneliness",
    ts: m(3),
    score: 18,
    upvotes: 19,
    downvotes: 1,
  },
  {
    id: "demo-ua-28",
    age: 28,
    countryCode: "UA",
    text: "I am writing this between sirens. think about that for a second.",
    category: "war",
    ts: m(7),
    score: 24,
    upvotes: 24,
    downvotes: 0,
  },
  {
    id: "demo-jp-41",
    age: 41,
    countryCode: "JP",
    text: "loneliness is killing more of us than any disease.",
    category: "loneliness",
    ts: m(11),
    score: 21,
    upvotes: 22,
    downvotes: 1,
  },
  {
    id: "demo-ng-23",
    age: 23,
    countryCode: "NG",
    text: "japa. we are all leaving. I really need to leave here.",
    category: "future",
    ts: m(14),
    score: 12,
    upvotes: 13,
    downvotes: 1,
  },
  {
    id: "demo-in-28",
    age: 28,
    countryCode: "IN",
    text: "This heated weather is going to boil us alive. The people who should care have an exit. We do not.",
    category: "climate",
    ts: m(19),
    score: 15,
    upvotes: 16,
    downvotes: 1,
  },
  {
    id: "demo-us-39",
    age: 39,
    countryCode: "US",
    text: "whether the government will nullify my marriage and break up my family because I'm married to another man.",
    category: "democracy",
    ts: m(23),
    score: 17,
    upvotes: 18,
    downvotes: 1,
  },
  {
    id: "demo-au-40",
    age: 40,
    countryCode: "AU",
    text: "The world has lost its brakes on the descent into cyberpunk dystopia and not enough people understand how boring it will appear until too late.",
    category: "future",
    ts: m(28),
    score: 9,
    upvotes: 10,
    downvotes: 1,
  },
  {
    id: "demo-us-24",
    age: 24,
    countryCode: "US",
    text: "i'm afraid i won't be able to buy a home.",
    category: "housing",
    ts: m(32),
    score: 14,
    upvotes: 15,
    downvotes: 1,
  },

  // supporting voices — for visual spread on the globe (more dots in more
  // continents) and so the bubble cycle has variety
  {
    id: "demo-br-30",
    age: 30,
    countryCode: "BR",
    text: "the rainforest is being sold and we are watching live.",
    category: "climate",
    ts: m(38),
    score: 8,
    upvotes: 8,
    downvotes: 0,
  },
  {
    id: "demo-de-29",
    age: 29,
    countryCode: "DE",
    text: "Everything is turning more right extremist again. It's scary.",
    category: "democracy",
    ts: m(42),
    score: 6,
    upvotes: 6,
    downvotes: 0,
  },
  {
    id: "demo-pk-27",
    age: 27,
    countryCode: "PK",
    text: "we keep treating an AI-led apocalypse as inevitable, when instead we're actively choosing it.",
    category: "ai",
    ts: m(48),
    score: 5,
    upvotes: 5,
    downvotes: 0,
  },
  {
    id: "demo-za-39",
    age: 39,
    countryCode: "ZA",
    text: "When will the drugs finally kill me.",
    category: "health",
    ts: m(53),
    score: 4,
    upvotes: 4,
    downvotes: 0,
  },
  {
    id: "demo-gb-30",
    age: 30,
    countryCode: "GB",
    text: "Is my generation delaying parenthood in fear of bringing children into this world?",
    category: "future",
    ts: m(58),
    score: 7,
    upvotes: 7,
    downvotes: 0,
  },
  {
    id: "demo-es-28",
    age: 28,
    countryCode: "ES",
    text: "Distrust in science is leading our societies to collapse.",
    category: "democracy",
    ts: m(64),
    score: 6,
    upvotes: 6,
    downvotes: 0,
  },
  {
    id: "demo-ph-19",
    age: 19,
    countryCode: "PH",
    text: "The world changes too quickly and no archives are made of it.",
    category: "other",
    ts: m(71),
    score: 3,
    upvotes: 3,
    downvotes: 0,
  },
  {
    id: "demo-ca-18",
    age: 18,
    countryCode: "CA",
    text: "Going to university and feeling like the path doesn't lead anywhere anymore.",
    category: "education",
    ts: m(78),
    score: 4,
    upvotes: 4,
    downvotes: 0,
  },
];

export const DEMO_CONCERNS: Concern[] = SEEDS.map((s) => ({
  ...s,
  bracket: ageToBracket(s.age),
}));

export const DEMO_SOLUTIONS: Solution[] = [];
