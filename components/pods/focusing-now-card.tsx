"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import type { PodFocusingMember } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border-[var(--accent)]/15 bg-[radial-gradient(circle_at_top_left,_rgba(198,243,90,0.08),_transparent_50%)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Focusing now</CardTitle>
            <CardDescription className="mt-1">
              {count
                ? `${count} in a block — the pod is live.`
                : "Nobody on the clock yet. Be the spark."}
            </CardDescription>
          </div>
          <Badge variant={count ? "accent" : "default"}>
            <Radio className="h-3 w-3" />
            {count ? `${count} live` : "Quiet"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-[var(--muted)]">{pulseLabel}</p>

        <AnimatePresence initial={false} mode="popLayout">
          {count ? (
            <ul className="space-y-2">
              {focusing.map((member) => {
                const isYou = member.userId === currentUserId;
                return (
                  <motion.li
                    key={member.sessionId}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-black/25 px-3.5 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                      </span>
                      <p className="truncate text-sm font-medium text-white">
                        {member.username}
                        {isYou ? " · you" : ""}
                      </p>
                    </div>
                    <p className="pp-mono shrink-0 text-xs text-[var(--muted)]">
                      since {formatClock(member.startedAt)}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-[var(--border)] px-3.5 py-4 text-sm text-[var(--muted)]"
            >
              Start a focus block and your name shows up here for the pod.
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
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
