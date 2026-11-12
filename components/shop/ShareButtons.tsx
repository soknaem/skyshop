"use client";

import { Link2, Send, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const toast = useToast();
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const btn = "btn-outline !px-3 !py-2";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-slate-500"><Share2 className="h-4 w-4" />Share</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1877f2]" aria-hidden><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" /></svg>Facebook
      </a>
      <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={btn}><Send className="h-4 w-4 text-[#229ed9]" />Telegram</a>
      <button type="button" className={btn} onClick={async () => { try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.error("Could not copy the link"); } }}><Link2 className="h-4 w-4" />Copy link</button>
    </div>
  );
}
