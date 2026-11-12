import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, ShieldCheck, UserCheck, UserPlus, UserX, Users } from "lucide-react";
import { adminApi } from "@/lib/api";
import { dateTime, initials } from "@/lib/format";
import type { ManagedUser, Page, UserSummary } from "@/lib/types";
import ClickableRow from "@/components/admin/ClickableRow";
import StatCard from "@/components/admin/StatCard";
import Pagination from "@/components/shop/Pagination";

export const metadata: Metadata = { title: "Users", robots: { index: false } };
const SIZE = 10;
type SP = { q?: string; role?: string; status?: string; provider?: string; page?: string };

const PROVIDER: Record<string, string> = { local: "Email", google: "Google", facebook: "Facebook", telegram: "Telegram" };

function Avatar({ u }: { u: ManagedUser }) {
  return u.avatar_url
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={u.avatar_url.startsWith("/media/") ? `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000"}${u.avatar_url}` : u.avatar_url} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
    : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initials(u.name)}</span>;
}

const badge = (text: string, cls: string) => <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>{text}</span>;
const roleBadge = (u: ManagedUser) => u.role === "ADMIN" ? badge("Admin", "bg-brand-soft text-brand ring-brand/20") : badge("Customer", "bg-slate-100 text-slate-700 ring-slate-200");
const statusBadge = (u: ManagedUser) => u.is_active ? badge("Active", "bg-emerald-50 text-emerald-700 ring-emerald-200") : badge("Disabled", "bg-sale-soft text-sale ring-sale/20");

export default async function AdminUsers({ searchParams }: { searchParams: Promise<SP> }) {
  const { q = "", role = "", status = "", provider = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const [summary, data] = await Promise.all([
    adminApi<UserSummary>("/api/auth/admin/users/summary"),
    adminApi<Page<ManagedUser>>(`/api/auth/admin/users?${new URLSearchParams({ q, role, status, provider, page: String(pageNo), page_size: String(SIZE) })}`),
  ]);
  const keep: Record<string, string> = {};
  for (const [k, v] of Object.entries({ q, role, status, provider })) if (v) keep[k] = v;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Users</h1><p className="text-sm text-slate-500">Customers and admins. Click a row to manage an account.</p></div>
        <Link href="/admin/users/new" className="btn-primary"><Plus className="h-4 w-4" />Add user</Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard label="All users" value={String(summary.total)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Customers" value={String(summary.customers)} icon={<UserCheck className="h-5 w-5" />} tone="volt" />
        <StatCard label="Admins" value={String(summary.admins)} icon={<ShieldCheck className="h-5 w-5" />} tone="ink" />
        <StatCard label="Disabled" value={String(summary.disabled)} icon={<UserX className="h-5 w-5" />} tone="sale" />
        <StatCard label="New (7 days)" value={String(summary.new_7d)} hint={Object.entries(summary.by_provider).map(([k, v]) => `${PROVIDER[k] ?? k} ${v}`).join(" · ")} icon={<UserPlus className="h-5 w-5" />} />
      </div>

      <form action="/admin/users" className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input data-search-input name="q" defaultValue={q} placeholder="Name, email or phone  (press / to focus)" className="input !pl-9" aria-label="Search users" /></div>
        <select name="role" defaultValue={role} className="input !w-auto" aria-label="Role"><option value="">Any role</option><option value="CUSTOMER">Customers</option><option value="ADMIN">Admins</option></select>
        <select name="status" defaultValue={status} className="input !w-auto" aria-label="Status"><option value="">Any status</option><option value="active">Active</option><option value="disabled">Disabled</option></select>
        <select name="provider" defaultValue={provider} className="input !w-auto" aria-label="Sign-in method"><option value="">Any sign-in</option>{Object.entries(PROVIDER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn-dark">Filter</button>
      </form>

      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3 pl-5 font-semibold">User</th><th className="p-3 font-semibold">Role</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Sign-in</th><th className="p-3 font-semibold">Last login</th><th className="p-3 pr-5 font-semibold">Joined</th></tr></thead>
          <tbody>
            {data.items.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-500">No users match.</td></tr>}
            {data.items.map((u) => (
              <ClickableRow key={u.id} href={`/admin/users/${u.id}`}>
                <td className="p-3 pl-5"><div className="flex items-center gap-3"><Avatar u={u} /><div className="min-w-0"><p className="truncate font-semibold">{u.name}</p><p className="truncate text-xs text-slate-500">{u.email || u.username}</p></div></div></td>
                <td className="p-3">{roleBadge(u)}</td><td className="p-3">{statusBadge(u)}</td><td className="p-3 text-slate-600">{PROVIDER[u.provider] ?? u.provider}</td>
                <td className="p-3 text-slate-600">{u.last_login ? dateTime(u.last_login) : "Never"}</td><td className="p-3 pr-5 text-slate-600">{dateTime(u.created_at)}</td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {data.items.length === 0 && <li className="card p-8 text-center text-sm text-slate-500">No users match.</li>}
        {data.items.map((u) => (
          <li key={u.id}><Link href={`/admin/users/${u.id}`} className="card card-hover flex items-center gap-3 p-4">
            <Avatar u={u} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.name}</p><p className="truncate text-xs text-slate-500">{u.email || u.username}</p><div className="mt-1.5 flex flex-wrap gap-1.5">{roleBadge(u)}{statusBadge(u)}</div></div>
          </Link></li>
        ))}
      </ul>
      <Pagination page={pageNo} total={data.total} pageSize={SIZE} basePath="/admin/users" params={keep} />
    </>
  );
}
