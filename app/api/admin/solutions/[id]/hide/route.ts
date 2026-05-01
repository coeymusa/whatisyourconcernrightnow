import { NextResponse } from "next/server";
import { adminAuthOk, patchRow } from "../../../../../lib/admin";

// POST /api/admin/solutions/[id]/hide
//   body (optional): { hidden?: boolean }
// Hides the solution by default. Pass { "hidden": false } to un-hide.
// Auth: Authorization: Bearer <ADMIN_TOKEN>
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!adminAuthOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }
  const hidden = (body as { hidden?: unknown })?.hidden === false ? false : true;

  const ok = await patchRow("solutions", id, { hidden });
  if (!ok) return NextResponse.json({ error: "patch failed" }, { status: 500 });
  return NextResponse.json({ ok: true, id, hidden });
}
