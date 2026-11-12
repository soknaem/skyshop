import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Mail, Phone } from "lucide-react";
import { ApiError, adminApi } from "@/lib/api";
import { dateTime, imageSrc, initials } from "@/lib/format";
import { getSession } from "@/lib/session";
import type { ManagedUser } from "@/lib/types";
import UserEditor from "@/components/admin/UserEditor";

export const metadata: Metadata = { title: "Manage user", robots: { index: false } };

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let u: ManagedUser;
  try {
    u = await adminApi<ManagedUser>(`/api/auth/admin/users/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  }
  const me = await getSession();
  const info = (icon: React.ReactNode, text: string) => <p className="flex items-center gap-2 text-sm text-slate-500"><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>{text}</p>;
  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Back to users</Link>
      <header className="card flex flex-wrap items-center gap-5 p-5 sm:p-6">
        {u.avatar_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={imageSrc(u.avatar_url)} alt="" referrerPolicy="no-referrer" className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-soft" />
          : <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-brand-soft">{initials(u.name)}</span>}
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate text-3xl font-bold">{u.name}</h1>
          {u.email && info(<Mail />, u.email)}
          {u.phone && info(<Phone />, u.phone)}
          <div className="flex flex-wrap gap-x-5 gap-y-1">{info(<Calendar />, `Joined ${dateTime(u.created_at)}`)}{info(<Clock />, u.last_login ? `Last login ${dateTime(u.last_login)}` : "Never logged in")}</div>
          <p className="text-xs text-slate-500">User #{u.id} · signs in with <b className="capitalize">{u.provider === "local" ? "email and password" : u.provider}</b></p>
        </div>
      </header>
      <UserEditor key={`${u.id}-${u.role}-${u.is_active}`} user={u} isSelf={me?.id === u.id} />
    </div>
  );
}
