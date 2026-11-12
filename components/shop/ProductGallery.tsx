"use client";

import { useState } from "react";
import { imageSrc } from "@/lib/format";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : [""];
  const [i, setI] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  return (
    <div className="space-y-3">
      <div className="card group relative aspect-square cursor-zoom-in overflow-hidden"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={list[i]} src={imageSrc(list[i])} alt={name} style={{ transformOrigin: origin }}
          className="h-full w-full animate-fade-in object-cover transition duration-300 group-hover:scale-[1.8]" />
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
          {list.map((src, n) => (
            <button key={src + n} type="button" onClick={() => setI(n)} aria-label={`Show image ${n + 1}`} aria-current={n === i}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${n === i ? "border-brand shadow-glow" : "border-line opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc(src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
