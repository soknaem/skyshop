"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";
type ToastAction = { label: string; href?: string; onClick?: () => void };
type Toast = { id: number; kind: Kind; message: string; action?: ToastAction };

type Api = {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
};

const EMPTY_API: Api = {
  success: () => {},
  error: () => {},
  info: () => {},
};

const Ctx = createContext<Api>(EMPTY_API);

export function useToast(): Api {
  return useContext(Ctx);
}

const STYLE: Record<Kind, { icon: typeof Info; ring: string; bar: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: "border-emerald-200", bar: "bg-emerald-500", iconColor: "text-emerald-600" },
  error: { icon: AlertCircle, ring: "border-sale/30", bar: "bg-sale", iconColor: "text-sale" },
  info: { icon: Info, ring: "border-brand/25", bar: "bg-brand", iconColor: "text-brand" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind: Kind, message: string, action?: ToastAction) => {
    const id = ++counter.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message, action }]);
    setTimeout(() => dismiss(id), kind === "error" ? 6500 : 4500);
  }, [dismiss]);

  const api = useMemo<Api>(() => ({
    success: (m, a) => push("success", m, a),
    error: (m, a) => push("error", m, a),
    info: (m, a) => push("info", m, a),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[380px]" aria-live="polite">
        {toasts.map((t) => {
          const s = STYLE[t.kind];
          const Icon = s.icon;
          return (
            <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
              className={`pointer-events-auto relative w-full animate-slide-in-right overflow-hidden rounded-2xl border ${s.ring} bg-surface/95 p-3.5 pr-10 shadow-lift backdrop-blur`}>
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-ink">{t.message}</p>
                  {t.action && (t.action.href ? (
                    <Link href={t.action.href} onClick={() => dismiss(t.id)} className="mt-1 inline-block text-sm font-semibold text-brand hover:underline">{t.action.label}</Link>
                  ) : (
                    <button type="button" onClick={() => { t.action?.onClick?.(); dismiss(t.id); }} className="mt-1 text-sm font-semibold text-brand hover:underline">{t.action.label}</button>
                  ))}
                </div>
              </div>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 transition hover:bg-mist hover:text-ink">
                <X className="h-4 w-4" />
              </button>
              <span className={`absolute inset-x-0 bottom-0 h-0.5 origin-left animate-shrink ${s.bar}`} />
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}