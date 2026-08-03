"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PodFocusingMember } from "@/lib/types";
import { Score } from "@/components/ui/score";

interface FocusingNowCardProps {
  focusing: PodFocusingMember[];
  todayMinutes: number;
  currentUserId?: number | null;
}

export function FocusingNowCard({
  focusing,
  todayMinutes,
  currentUserId,
}: FocusingNowCardProps) {
  const count = focusing.length;
  const pulseLabel = formatPodPulse(todayMinutes);

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-strong)] p-1">
      <div className="rounded-[calc(1.75rem-0.25rem)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="pp-display text-lg font-semibold text-white">
              Focusing now
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">{pulseLabel}</p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              count
                ? "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[#d7f98a]"
                : "border-[var(--border)] bg-white/[0.03] text-[var(--muted)]"
            }`}
          >
            {count ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                <Score value={count} />
                <span>live</span>
              </>
            ) : (
              "Quiet"
            )}
          </div>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {count ? (
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {focusing.map((member) => {
                const isYou = member.userId === currentUserId;
                const initial = member.username.slice(0, 1).toUpperCase();
                return (
                  <motion.li
                    key={member.sessionId}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="flex min-w-[9.5rem] shrink-0 items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-black/25 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {member.username}
                        {isYou ? " · you" : ""}
                      </p>
                      <p className="pp-mono text-[11px] text-[var(--muted)]">
                        since {formatClock(member.startedAt)}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-[var(--muted)]"
            >
              Start a focus block and your name shows up here for the pod.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatPodPulse(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return "Pod focused 0m today.";
  }
  if (totalMinutes < 60) {
    return `Pod focused ${totalMinutes}m today.`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes
    ? `Pod focused ${hours}h ${minutes}m today.`
    : `Pod focused ${hours}h today.`;
}

function formatClock(startedAt: string) {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
