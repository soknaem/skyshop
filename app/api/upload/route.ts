import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

/** Admin image upload: the browser posts the file here; this adds the admin JWT (httpOnly cookie) and forwards it. */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  const incoming = await req.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
  const form = new FormData();
  form.set("file", file, file.name);
  try {
    const r = await fetch(`${API_URL}/api/media/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json({ error: data?.error?.message ?? "Upload failed" }, { status: r.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Cannot reach the media service" }, { status: 503 });
  }
}
