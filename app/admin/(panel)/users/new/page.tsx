import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UserCreateForm from "@/components/admin/UserCreateForm";

export const metadata: Metadata = { title: "Add user", robots: { index: false } };

export default function NewUser() {
  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Back to users</Link>
      <h1 className="mb-6 mt-2 text-3xl font-bold">Add user</h1>
      <UserCreateForm />
    </>
  );
}
