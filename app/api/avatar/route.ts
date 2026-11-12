import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

/** Profile picture upload for any logged-in user (the browser posts here; the logged-in token is added server-side). */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
  const form = new FormData();
  form.set("file", file, file.name);
  try {
    const r = await fetch(`${API_URL}/api/media/avatar`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json({ error: data?.error?.message ?? "Upload failed" }, { status: r.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Cannot reach the media service" }, { status: 503 });
  }
}
