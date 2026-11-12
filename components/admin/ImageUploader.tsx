"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Star, Trash2, UploadCloud } from "lucide-react";
import { imageSrc } from "@/lib/format";
import { useToast } from "@/components/ui/Toaster";

const MAX = 8;
const MAX_MB = 5;

function upload(file: File, onProgress: (p: number) => void): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        xhr.status >= 200 && xhr.status < 300 ? resolve(data) : reject(new Error(data.error ?? "Upload failed"));
      } catch { reject(new Error("Upload failed")); }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

/** Upload product pictures (drag and drop or choose files), or paste an image link. First picture = main picture. */
export default function ImageUploader({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState<{ name: string; progress: number }[]>([]);
  const [link, setLink] = useState("");
  const current = useRef(images);
  current.current = images;

  async function handle(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) { toast.error("Please choose image files (JPG, PNG, WEBP or GIF)"); return; }
    const room = MAX - current.current.length;
    if (room <= 0) { toast.error(`You can add up to ${MAX} images`); return; }
    for (const file of list.slice(0, room)) {
      if (file.size > MAX_MB * 1024 * 1024) { toast.error(`${file.name} is larger than ${MAX_MB} MB`); continue; }
      setBusy((b) => [...b, { name: file.name, progress: 0 }]);
      try {
        const res = await upload(file, (p) => setBusy((b) => b.map((x) => (x.name === file.name ? { ...x, progress: p } : x))));
        onChange([...current.current, res.url]);
        current.current = [...current.current, res.url];
        toast.success(`${file.name} uploaded`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy((b) => b.filter((x) => x.name !== file.name));
      }
    }
  }

  function addLink() {
    const u = link.trim();
    if (!/^https?:\/\/|^\/(media|products)\//.test(u)) { toast.error("Enter a full image link starting with https://"); return; }
    if (images.length >= MAX) { toast.error(`You can add up to ${MAX} images`); return; }
    onChange([...images, u]);
    setLink("");
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${drag ? "border-brand bg-brand-soft" : "border-line bg-mist/60 hover:border-brand/50 hover:bg-brand-soft/40"}`}>
        <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-brand shadow-card"><UploadCloud className="h-6 w-6" /></span>
        <p className="text-sm font-semibold">Drop images here or <span className="text-brand">browse</span></p>
        <p className="mt-0.5 text-xs text-slate-500">JPG, PNG, WEBP or GIF · up to {MAX_MB} MB each · max {MAX} images</p>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) handle(e.target.files); e.target.value = ""; }} />
      </div>

      {(images.length > 0 || busy.length > 0) && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={src + i} className="group relative aspect-square animate-scale-in overflow-hidden rounded-xl border border-line bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc(src)} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-volt px-2 py-0.5 text-[10px] font-bold text-night"><Star className="h-3 w-3 fill-current" />Main</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-night/70 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                {i !== 0 && <button type="button" onClick={() => onChange([src, ...images.filter((_, n) => n !== i)])} className="rounded-lg bg-surface/90 px-2 py-1 text-[10px] font-semibold hover:bg-surface">Make main</button>}
                <button type="button" aria-label="Remove image" onClick={() => onChange(images.filter((_, n) => n !== i))} className="rounded-lg bg-surface/90 p-1.5 text-sale hover:bg-surface"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
          {busy.map((b) => (
            <li key={b.name} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-line bg-mist p-2 text-center">
              <ImagePlus className="h-5 w-5 animate-pulse text-brand" />
              <span className="line-clamp-1 text-[10px] text-slate-500">{b.name}</span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface"><span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${b.progress}%` }} /></span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1"><Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} placeholder="…or paste an image link" className="input !pl-9" aria-label="Image link" /></div>
        <button type="button" onClick={addLink} className="btn-outline">Add link</button>
      </div>
    </div>
  );
}
