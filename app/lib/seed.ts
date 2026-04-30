import type { Concern, ConcernCategory, Solution } from "./types";
import { ageToBracket } from "./types";

type Seed = Omit<Concern, "id" | "ts" | "bracket">;

// 120 hand-written concerns. Real-feeling, raw, varied in age/country/category.
const RAW: Seed[] = [
  // North America
  { age: 28, countryCode: "US", text: "I won't be able to afford a child even if I wanted one.", category: "economy" },
  { age: 19, countryCode: "US", text: "we're being trained to be lonely and call it freedom", category: "loneliness" },
  { age: 47, countryCode: "US", text: "my parents need care and the system is a meat grinder.", category: "health" },
  { age: 34, countryCode: "US", text: "the country my kids inherit will not be the one I grew up in.", category: "future" },
  { age: 22, countryCode: "US", text: "rent ate my twenties.", category: "housing" },
  { age: 61, countryCode: "US", text: "I no longer recognise my neighbours politically. it's frightening.", category: "democracy" },
  { age: 17, countryCode: "US", text: "school shootings, but somehow we're talking about phones.", category: "war" },
  { age: 41, countryCode: "CA", text: "every year fire season starts earlier. we're just getting used to it.", category: "climate" },
  { age: 25, countryCode: "CA", text: "I'm 25 and I can't picture owning anything. ever.", category: "housing" },
  { age: 33, countryCode: "MX", text: "violence and silence. that's the contract here.", category: "war" },

  // South America
  { age: 30, countryCode: "BR", text: "the rainforest is being sold and we are watching live.", category: "climate" },
  { age: 24, countryCode: "BR", text: "my generation doesn't believe in politics and that scares me.", category: "democracy", original: { lang: "Portuguese", text: "minha geração não acredita em política e isso me assusta." } },
  { age: 52, countryCode: "AR", text: "I have stopped trying to understand the currency.", category: "economy" },
  { age: 38, countryCode: "CL", text: "we wrote a constitution and threw it away. twice.", category: "democracy" },
  { age: 27, countryCode: "CO", text: "peace is a word politicians use before signing a war contract.", category: "war" },
  { age: 45, countryCode: "VE", text: "my children live on three continents.", category: "inequality" },
  { age: 19, countryCode: "PE", text: "no jobs, no future, only TikTok.", category: "future" },

  // Western Europe
  { age: 36, countryCode: "GB", text: "the NHS is dying and we're arguing about flags.", category: "health" },
  { age: 23, countryCode: "GB", text: "rent is 70% of my salary and I'm told I'm lucky.", category: "housing" },
  { age: 58, countryCode: "GB", text: "we elected our own decline.", category: "democracy" },
  { age: 31, countryCode: "FR", text: "democracy looks more and more like theatre.", category: "democracy", original: { lang: "French", text: "la démocratie ressemble de plus en plus à une mise en scène." } },
  { age: 26, countryCode: "FR", text: "we'll burn another summer. literally.", category: "climate" },
  { age: 44, countryCode: "DE", text: "the centre is hollowing out. I can feel it.", category: "democracy" },
  { age: 29, countryCode: "DE", text: "I'm afraid we forgot what we promised never to forget.", category: "war" },
  { age: 35, countryCode: "ES", text: "we don't make it to the end of the month and nobody on TV is saying it.", category: "economy", original: { lang: "Spanish", text: "no llegamos a fin de mes y nadie habla de eso en la tele." } },
  { age: 21, countryCode: "PT", text: "everyone smart leaves. those of us who stay feel left behind.", category: "future" },
  { age: 39, countryCode: "IT", text: "we are a country of grandparents. and of only children, and sad ones.", category: "loneliness", original: { lang: "Italian", text: "siamo un paese di nonni. e di figli unici e tristi." } },
  { age: 48, countryCode: "NL", text: "the polders won't hold forever.", category: "climate" },
  { age: 33, countryCode: "BE", text: "young men I know are radicalising in real time.", category: "democracy" },
  { age: 55, countryCode: "CH", text: "we are an island of comfort surrounded by collapse. the moat is shrinking.", category: "future" },
  { age: 27, countryCode: "AT", text: "the far right speaks softly now. that scares me more.", category: "democracy" },

  // Nordics
  { age: 30, countryCode: "SE", text: "gang violence in a country that promised it couldn't happen here.", category: "war" },
  { age: 42, countryCode: "NO", text: "we got rich on the thing that's killing the planet. nobody says it.", category: "climate" },
  { age: 24, countryCode: "DK", text: "I have everything. I feel nothing. that's the concern.", category: "loneliness" },
  { age: 36, countryCode: "FI", text: "the border is closed. it didn't used to mean anything.", category: "war" },
  { age: 67, countryCode: "IS", text: "the glaciers I grew up with are names now.", category: "climate" },

  // Eastern Europe
  { age: 37, countryCode: "PL", text: "we are one election from no longer being a democracy.", category: "democracy" },
  { age: 29, countryCode: "CZ", text: "rent in Prague has eaten our generation.", category: "housing" },
  { age: 54, countryCode: "HU", text: "the words have been hollowed out. democracy. court. press.", category: "democracy" },
  { age: 26, countryCode: "RO", text: "everyone I love has left.", category: "loneliness" },
  { age: 32, countryCode: "GR", text: "we never recovered. we just stopped talking about it.", category: "economy" },
  { age: 28, countryCode: "UA", text: "I am writing this between sirens. think about that for a second.", category: "war" },
  { age: 42, countryCode: "UA", text: "my son is 18 next year. I can't breathe.", category: "war" },
  { age: 51, countryCode: "RU", text: "we have learned to whisper again.", category: "democracy" },
  { age: 23, countryCode: "RU", text: "everyone with hope has left or stopped speaking.", category: "future" },

  // Middle East / N. Africa
  { age: 34, countryCode: "TR", text: "the lira is fiction and we are tired of pretending.", category: "economy" },
  { age: 27, countryCode: "TR", text: "earthquakes will come again and we will pretend we are surprised.", category: "future" },
  { age: 31, countryCode: "IL", text: "everyone I know has stopped sleeping.", category: "war" },
  { age: 24, countryCode: "PS", text: "I am writing this and I do not know if my street will exist tomorrow.", category: "war" },
  { age: 38, countryCode: "LB", text: "the banks took our savings and the world looked away.", category: "economy" },
  { age: 29, countryCode: "EG", text: "bread is political and so is silence.", category: "economy" },
  { age: 22, countryCode: "SA", text: "we are told we are progressing. the line is thin.", category: "democracy" },
  { age: 44, countryCode: "IR", text: "my daughter does not wear what I wear and I am terrified for her.", category: "democracy" },
  { age: 33, countryCode: "IQ", text: "we are forgotten. that is the new violence.", category: "war" },

  // South Asia
  { age: 26, countryCode: "PK", text: "the air is killing us slowly and politicians blame each other.", category: "climate" },
  { age: 31, countryCode: "IN", text: "the air in Delhi is no longer breathable in November.", category: "climate" },
  { age: 23, countryCode: "IN", text: "we have AI before we have toilets in some places.", category: "inequality" },
  { age: 45, countryCode: "IN", text: "majoritarianism is dressed up as patriotism. it is not.", category: "democracy" },
  { age: 28, countryCode: "BD", text: "the water is taking the south of my country.", category: "climate" },
  { age: 36, countryCode: "LK", text: "we ran out of fuel and dignity in the same week.", category: "economy" },
  { age: 19, countryCode: "NP", text: "the mountains are losing their snow.", category: "climate" },

  // East Asia
  { age: 29, countryCode: "CN", text: "it is hard to plan a life when planning a life is also a risk.", category: "future" },
  { age: 34, countryCode: "CN", text: "our generation is afraid to have children — and that should worry the world.", category: "economy", original: { lang: "Mandarin", text: "我们这代人不敢生孩子 — and that should worry the world." } },
  { age: 41, countryCode: "JP", text: "loneliness is killing more of us than any disease.", category: "loneliness" },
  { age: 25, countryCode: "JP", text: "the country is shrinking and nobody talks about it at dinner.", category: "future" },
  { age: 27, countryCode: "KR", text: "we are too tired to date, marry, or hope.", category: "loneliness" },
  { age: 22, countryCode: "KR", text: "the air-raid drills feel less like drills now.", category: "war" },
  { age: 32, countryCode: "TW", text: "we live on a fault line of our own and someone else's making.", category: "war" },
  { age: 30, countryCode: "HK", text: "we lost a city. people don't say it like that. but we did.", category: "democracy" },

  // SE Asia / Oceania
  { age: 27, countryCode: "PH", text: "another typhoon. another fundraiser. the cycle is the policy.", category: "climate" },
  { age: 33, countryCode: "VN", text: "the delta is sinking and rice is salt now.", category: "climate" },
  { age: 41, countryCode: "TH", text: "tourism returned. soul did not.", category: "future" },
  { age: 24, countryCode: "MY", text: "race politics is the only politics we are allowed.", category: "democracy" },
  { age: 35, countryCode: "SG", text: "the price of certainty is silence. we pay it daily.", category: "democracy" },
  { age: 29, countryCode: "ID", text: "Jakarta is sinking. we are building a new capital instead of saving the old one.", category: "climate" },
  { age: 38, countryCode: "AU", text: "another summer of red skies. we keep voting like it's normal.", category: "climate" },
  { age: 21, countryCode: "AU", text: "I cannot afford to live where I was born.", category: "housing" },
  { age: 46, countryCode: "NZ", text: "we are alone at the bottom of the world and somehow still polarised.", category: "democracy" },

  // Africa
  { age: 26, countryCode: "ZA", text: "the lights go out for hours and we joke. that's how we cope.", category: "economy" },
  { age: 31, countryCode: "ZA", text: "I am tired of funerals.", category: "war" },
  { age: 22, countryCode: "NG", text: "japa. we are all leaving. the country is hollowing out.", category: "future" },
  { age: 28, countryCode: "NG", text: "my best friends are spread across four countries now.", category: "loneliness" },
  { age: 19, countryCode: "KE", text: "they shot us in the streets last summer. nobody was held to account.", category: "democracy" },
  { age: 33, countryCode: "ET", text: "I have lived through more than one war already.", category: "war" },
  { age: 37, countryCode: "GH", text: "the cedi loses meaning faster than I can earn it.", category: "economy" },
  { age: 24, countryCode: "MA", text: "the water tables are dropping and the prayers are unchanged.", category: "climate" },
  { age: 29, countryCode: "DZ", text: "we are young, educated, and unwanted by our own state.", category: "future" },
  { age: 32, countryCode: "TN", text: "the revolution turned into a question mark.", category: "democracy" },

  // Misc / cross-cutting
  { age: 16, countryCode: "US", text: "I'm scared the people in charge don't actually believe in tomorrow.", category: "future" },
  { age: 18, countryCode: "DE", text: "I see my parents arguing online with strangers. that is the future I get.", category: "democracy" },
  { age: 20, countryCode: "GB", text: "AI will read this before another human does. that is the concern.", category: "ai" },
  { age: 26, countryCode: "FR", text: "everyone I know is medicated and pretending it's fine.", category: "health" },
  { age: 35, countryCode: "IN", text: "my parents trust whatever WhatsApp tells them.", category: "ai" },
  { age: 40, countryCode: "US", text: "we automated empathy out of customer service. now we're doing it everywhere.", category: "ai" },
  { age: 29, countryCode: "JP", text: "the AI talks to me more than my coworkers. I don't think this is a bug.", category: "loneliness" },
  { age: 45, countryCode: "IT", text: "I no longer trust any image I see.", category: "ai" },
  { age: 22, countryCode: "ES", text: "we used to dream of leaving the village. now we dream of returning.", category: "future" },
  { age: 60, countryCode: "FR", text: "my generation consumed everything. I'm sorry.", category: "climate", original: { lang: "French", text: "ma génération a tout consommé. je m'en excuse." } },
  { age: 33, countryCode: "BR", text: "I can no longer tell satire from policy.", category: "democracy" },
  { age: 26, countryCode: "AR", text: "I priced an apartment in dollars. then in eggs. eggs were more stable.", category: "economy" },
  { age: 30, countryCode: "PL", text: "the church and the state had a baby and named it law.", category: "democracy" },
  { age: 50, countryCode: "RU", text: "history rhymes and we are the chorus.", category: "war" },
  { age: 24, countryCode: "EG", text: "I have a degree. I drive for an app. I am one of the lucky ones.", category: "economy" },
  { age: 27, countryCode: "IN", text: "the rivers I prayed in are landfill now.", category: "climate" },
  { age: 31, countryCode: "MX", text: "I have stopped saying out loud where my brother works.", category: "war" },
  { age: 38, countryCode: "GR", text: "the islands are full of tourists and empty of futures.", category: "economy" },
  { age: 19, countryCode: "BD", text: "monsoons used to be a season. now they are an emergency.", category: "climate" },
  { age: 28, countryCode: "TR", text: "we are governed by men who are at war with the future.", category: "democracy" },
  { age: 44, countryCode: "ZA", text: "the inequality here is not a bug; it is the operating system.", category: "inequality" },
  { age: 23, countryCode: "GH", text: "the diaspora sends money. we send hope. neither is enough.", category: "economy" },
  { age: 17, countryCode: "PH", text: "I will be the first generation poorer than my parents.", category: "future" },
  { age: 35, countryCode: "FI", text: "I am training my replacement. it doesn't sleep.", category: "ai" },
  { age: 29, countryCode: "NL", text: "my landlord is an algorithm.", category: "housing" },
  { age: 41, countryCode: "DE", text: "we built the EU on a promise. I don't know if my kids will inherit it.", category: "democracy" },
  { age: 33, countryCode: "KR", text: "I have a doctorate and a delivery bike. that is the joke.", category: "inequality" },
  { age: 36, countryCode: "AU", text: "I worry about the bees more than the budget.", category: "climate" },
  { age: 21, countryCode: "IE", text: "I won't live in the country I was born in. nobody under 30 will.", category: "housing" },
  { age: 42, countryCode: "CA", text: "the hospital wait list is longer than the ferry schedule.", category: "health" },
  { age: 25, countryCode: "SE", text: "the thing about peace is you don't notice until it's gone.", category: "war" },
];

// Deterministic pseudo-random so SSR + client agree (no hydration mismatch).
function det(i: number): number {
  // simple LCG-ish hash
  let x = (i * 2654435761) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 0xffffffff;
}

// Anchor seed timestamps to a fixed origin so they don't depend on Date.now().
// We treat seeds as "always recent" — they're for visual density, not real telemetry.
const SEED_ORIGIN = 1714521600000; // arbitrary fixed epoch (May 2024)

export const SEED_CONCERNS: Concern[] = RAW.map((r, i) => ({
  ...r,
  id: `seed-${i}`,
  bracket: ageToBracket(r.age),
  // spread timestamps over a deterministic 36-hour window
  ts: SEED_ORIGIN - Math.floor(det(i) * 1000 * 60 * 60 * 36),
}));

// Sample of more open-ended fragments used by the synthetic ticker to simulate
// arrivals while the user is on the page. Keep these tiny and ambient.
export const STREAM_FRAGMENTS: Array<Omit<Seed, "category"> & { category: ConcernCategory }> = [
  { age: 24, countryCode: "US", text: "the news is louder than my own thoughts.", category: "loneliness" },
  { age: 31, countryCode: "IN", text: "the heat is getting personal.", category: "climate" },
  { age: 28, countryCode: "GB", text: "my generation is the experiment.", category: "future" },
  { age: 19, countryCode: "BR", text: "everyone I follow is angry. all the time.", category: "democracy" },
  { age: 35, countryCode: "DE", text: "I miss being bored.", category: "loneliness" },
  { age: 22, countryCode: "FR", text: "we keep marching. nothing keeps changing.", category: "democracy" },
  { age: 41, countryCode: "AU", text: "the smoke season is now a season.", category: "climate" },
  { age: 26, countryCode: "JP", text: "everyone is online. nobody is reachable.", category: "loneliness" },
  { age: 37, countryCode: "ZA", text: "we joke about loadshedding. we are not laughing.", category: "economy" },
  { age: 20, countryCode: "CA", text: "the rent went up again.", category: "housing" },
  { age: 33, countryCode: "IT", text: "I am 33 and I live with my mother.", category: "economy" },
  { age: 29, countryCode: "MX", text: "I have lost two friends to the road.", category: "war" },
  { age: 45, countryCode: "ID", text: "the rains do not come when they should.", category: "climate" },
  { age: 18, countryCode: "NG", text: "I have already applied for three visas.", category: "future" },
  { age: 27, countryCode: "PL", text: "the air sirens are a sound I now know.", category: "war" },
  { age: 38, countryCode: "AR", text: "I priced a coffee. I cried. that is the truth.", category: "economy" },
  { age: 23, countryCode: "ES", text: "I have a degree and a job and I cannot leave home.", category: "housing" },
  { age: 30, countryCode: "TR", text: "every news cycle is a fresh injury.", category: "democracy" },
  { age: 34, countryCode: "VN", text: "the river tastes different than it did.", category: "climate" },
  { age: 21, countryCode: "PH", text: "I worry about my mother during typhoons.", category: "climate" },
];

// Hand-written seed responses tied to specific seed concern indices.
// Each is a small act of solidarity, perspective, or practical advice.
type RawSolution = { concernIndex: number; age: number; countryCode: string; text: string };

const RAW_SOLUTIONS: RawSolution[] = [
  { concernIndex: 0, age: 41, countryCode: "DK", text: "we had two kids on a teacher's salary. it was not the right time. it was never going to be. you start anyway." },
  { concernIndex: 0, age: 33, countryCode: "PT", text: "the math will not work. nobody's does. love is the math." },
  { concernIndex: 1, age: 52, countryCode: "JP", text: "leave the apps for a month. ride a bus. talk to one stranger a day. it is brutally simple and it works." },
  { concernIndex: 2, age: 39, countryCode: "DE", text: "make one decision before the crisis: who has medical power of attorney. write it down. it spares everyone." },
  { concernIndex: 4, age: 45, countryCode: "GB", text: "split the city. pool with a friend. own one bedroom together. it's not failure, it's how we used to do it." },
  { concernIndex: 6, age: 28, countryCode: "AU", text: "join the local school board. one person showing up changes the room." },
  { concernIndex: 7, age: 50, countryCode: "CA", text: "the fires are real. the despair is optional. plant something native this weekend." },
  { concernIndex: 10, age: 42, countryCode: "BR", text: "support indigenous-led land trusts directly. money does what petitions can't." },
  { concernIndex: 14, age: 34, countryCode: "AR", text: "we wrote a constitution. that mattered. losing a vote is not the same as losing the principle." },
  { concernIndex: 17, age: 60, countryCode: "GB", text: "every nurse you meet — say thank you out loud. then write your MP. one without the other is decoration." },
  { concernIndex: 18, age: 31, countryCode: "GB", text: "rent strike. it sounds dramatic. it is also the only thing landlords actually fear." },
  { concernIndex: 19, age: 70, countryCode: "GB", text: "we voted our way in. we can vote our way out. show up to every local council meeting until then." },
  { concernIndex: 22, age: 48, countryCode: "DE", text: "the centre is whoever shows up. show up." },
  { concernIndex: 27, age: 36, countryCode: "DK", text: "go to a concert alone next saturday. it counts. trust me." },
  { concernIndex: 31, age: 29, countryCode: "PL", text: "join an NGO that works on independent press. boring is the work." },
  { concernIndex: 41, age: 55, countryCode: "IL", text: "talk to one person who is on the other side every week. it costs nothing and changes everything." },
  { concernIndex: 42, age: 23, countryCode: "JO", text: "writing it down counts. we are reading it. you are not invisible." },
  { concernIndex: 47, age: 39, countryCode: "IN", text: "switch household to LPG and an air purifier in the bedroom. won't fix Delhi. will fix tonight." },
  { concernIndex: 49, age: 44, countryCode: "IN", text: "subscribe to one newspaper that disagrees with your father. read the headlines aloud at dinner." },
  { concernIndex: 56, age: 31, countryCode: "JP", text: "the country shrinking is a problem we can be proud of solving slowly. don't import the panic." },
  { concernIndex: 58, age: 52, countryCode: "KR", text: "a hobby that costs nothing. a friend who is older than you. a walk that has no destination." },
  { concernIndex: 64, age: 26, countryCode: "PH", text: "join a barangay disaster prep group. it's the most useful thing I've ever done." },
  { concernIndex: 67, age: 47, countryCode: "MY", text: "vote in the Bersih marches. boring is the strategy." },
  { concernIndex: 71, age: 33, countryCode: "AU", text: "the bees thing — plant grevillea, banksia, native lavender. corridor matters more than mass." },
  { concernIndex: 76, age: 24, countryCode: "NG", text: "if you're staying — find five other stayers. that's the country." },
  { concernIndex: 77, age: 30, countryCode: "GH", text: "the diaspora is also you in five years. start the WhatsApp group now." },
  { concernIndex: 89, age: 29, countryCode: "MX", text: "we are not the cartels. we are not the silence either. write your name on something." },
  { concernIndex: 92, age: 36, countryCode: "FI", text: "learn to teach the model. you outlast it that way." },
  { concernIndex: 96, age: 40, countryCode: "AU", text: "give 10% to the cause that scares you most. money where the fear is." },
  { concernIndex: 99, age: 51, countryCode: "CA", text: "find a GP outside the major city. drive 90 minutes. waitlists are smaller. nobody talks about this." },
  { concernIndex: 24, age: 38, countryCode: "ES", text: "cooperative grocery, neighborhood swap. we all stopped going to the supermarket. it works." },
  { concernIndex: 13, age: 44, countryCode: "CL", text: "the second draft will come. movements are long. rest." },
  { concernIndex: 32, age: 27, countryCode: "BG", text: "you are not alone here. write to someone who left. they want to hear from home." },
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
