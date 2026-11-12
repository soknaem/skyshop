import type { Metadata } from "next";
import ChatInbox from "@/components/admin/ChatInbox";

export const metadata: Metadata = { title: "Live chat", robots: { index: false } };

export default function AdminChat() {
  return (
    <>
      <div className="mb-6"><h1 className="text-3xl font-bold">Live chat</h1><p className="text-sm text-slate-500">Reply to customers in real time. While this page or any admin page is open, customers see you as online.</p></div>
      <ChatInbox />
    </>
  );
}
