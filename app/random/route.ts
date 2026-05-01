import { redirect } from "next/navigation";
import { fetchRecent, hasSupabase } from "../lib/supabase";

// /random — stumble on a random anonymous dispatch. Lets readers serendipitously
// discover the record one voice at a time.
export const revalidate = 60;

export async function GET() {
  if (!hasSupabase()) redirect("/world");
  const rows = await fetchRecent(200, 0, 0);
  if (rows.length === 0) redirect("/world");
  const r = rows[Math.floor(Math.random() * rows.length)];
  redirect(`/dispatch/${r.id}`);
}
