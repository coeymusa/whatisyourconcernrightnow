import { redirect } from "next/navigation";
import { COUNTRIES } from "../../lib/countries";
import { fetchCountryCounts, hasSupabase } from "../../lib/supabase";

// /world/random — redirect to a random country dossier. Active countries
// (countries that have submissions) are weighted higher so the surprise
// lands somewhere with content.
export const revalidate = 300;

export async function GET() {
  let pool = COUNTRIES.map((c) => c.code);
  if (hasSupabase()) {
    const counts = await fetchCountryCounts();
    const active = COUNTRIES.filter((c) => (counts.get(c.code) ?? 0) > 0).map(
      (c) => c.code,
    );
    if (active.length > 0) {
      // Bias 75% to active countries.
      pool = Math.random() < 0.75 ? active : pool;
    }
  }
  const code = pool[Math.floor(Math.random() * pool.length)];
  redirect(`/world/${code}`);
}
