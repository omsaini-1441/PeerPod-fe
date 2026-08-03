"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Score } from "@/components/ui/score";
import { cn } from "@/lib/utils";

type ToastTone = "error" | "success" | "info" | "points";

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  points?: number;
}

interface ToastContextValue {
  push: (message: string, tone?: ToastTone) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  points: (points: number, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function parsePointsMessage(message: string): number | null {
  const match = message.match(/^\+(\d+)\s*pts/i);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = "info", pointsOverride?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const parsedPoints = pointsOverride ?? parsePointsMessage(message);
      const resolvedTone =
        (tone === "success" || tone === "points") && parsedPoints !== null
          ? "points"
          : tone;

      setToasts((current) => [
        ...current.slice(-3),
        {
          id,
          message,
          tone: resolvedTone,
          points: parsedPoints ?? undefined,
        },
      ]);
      window.setTimeout(
        () => dismiss(id),
        resolvedTone === "points" ? 4800 : 4200,
      );
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push: (message, tone) => push(message, tone),
      error: (message) => push(message, "error"),
      success: (message) => push(message, "success"),
      info: (message) => push(message, "info"),
      points: (earned, message) =>
        push(message ?? `+${earned} pts — board updated.`, "points", earned),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border px-3.5 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                toast.tone === "error" &&
                  "border-[var(--danger)]/30 bg-[#1a1010]/95 text-[#ffb4ae]",
                toast.tone === "success" &&
                  "border-[var(--accent)]/30 bg-[#10140c]/95 text-[#d7f98a]",
                toast.tone === "info" &&
                  "border-[var(--border-strong)] bg-[#101210]/95 text-[var(--foreground)]",
                toast.tone === "points" &&
                  "border-[var(--accent)]/40 bg-[#10140c]/95 text-[#d7f98a] shadow-[0_0_32px_rgba(198,243,90,0.12)]",
              )}
            >
              {toast.tone === "points" && toast.points !== undefined ? (
                <div className="min-w-0 flex-1 space-y-1">
                  <Score
                    value={toast.points}
                    prefix="+"
                    suffix="pts"
                    className="text-lg font-semibold text-[var(--accent)]"
                  />
                  <p className="leading-5 text-[var(--muted)]">
                    {toast.message.replace(/^\+\d+\s*pts\s*[—-]\s*/i, "") ||
                      "Board updated."}
                  </p>
                </div>
              ) : (
                <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-1 text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
