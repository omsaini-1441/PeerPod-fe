"use client";

import { motion } from "framer-motion";
import { Crown, TrendingUp } from "lucide-react";
import type { LeaderboardResponse, Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface LeaderboardCardProps {
  leaderboard: LeaderboardResponse | null;
  profile: Profile | null;
}

export function LeaderboardCard({ leaderboard, profile }: LeaderboardCardProps) {
  const entries = leaderboard?.leaderboard ?? [];
  const leader = entries[0] ?? null;
  const myEntry = entries.find((entry) => entry.userId === profile?.id) ?? null;
  const maxPoints = Math.max(...entries.map((entry) => entry.points), 1);
  const gapToFirst =
    leader && myEntry && myEntry.rank > 1
      ? Math.max(0, leader.points - myEntry.points)
      : 0;
  const isLeading = Boolean(myEntry && myEntry.rank === 1);

  return (
    <Card className="overflow-hidden border-[var(--leader)]/15 bg-[radial-gradient(circle_at_top_right,_rgba(245,215,110,0.1),_transparent_45%)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription className="mt-1">
              This week&apos;s race — first place is still up for grabs.
            </CardDescription>
          </div>
          {leaderboard?.myRank ? (
            <Badge variant={isLeading ? "warning" : "accent"}>
              You #{leaderboard.myRank}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {entries.length ? (
          <>
            <div
              className={cn(
                "rounded-2xl border px-4 py-3",
                isLeading
                  ? "border-[var(--leader)]/35 bg-[var(--leader-soft)]"
                  : "border-[var(--chase)]/30 bg-[var(--chase-soft)]",
              )}
            >
              <div className="flex items-start gap-3">
                {isLeading ? (
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--leader)]" />
                ) : (
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--chase)]" />
                )}
                <div className="min-w-0">
                  {isLeading ? (
                    <>
                      <p className="text-sm font-medium text-white">
                        You own first place right now.
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Keep stacking focus blocks — everyone else is hunting your
                        seat.
                      </p>
                    </>
                  ) : leader && myEntry ? (
                    <>
                      <p className="text-sm font-medium text-white">
                        {gapToFirst === 0
                          ? `Tied with ${leader.username} for the top.`
                          : `${gapToFirst} pts behind ${leader.username}.`}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        One focused block can move the board. Don&apos;t gift them
                        the week.
                      </p>
                    </>
                  ) : leader ? (
                    <>
                      <p className="text-sm font-medium text-white">
                        {leader.username} leads with {leader.points} pts.
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Start a focus block and put your name on the race.
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-black/25 p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--leader)]" />
                  Leading
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--chase)]" />
                  You
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--muted)]" />
                  Others
                </span>
              </div>

              <div className="space-y-4">
                {entries.map((entry) => {
                  const isCurrentUser = profile?.id === entry.userId;
                  const isFirst = entry.rank === 1;
                  const widthPct = Math.max(8, (entry.points / maxPoints) * 100);
                  const pointsBehindLeader = leader
                    ? Math.max(0, leader.points - entry.points)
                    : 0;

                  return (
                    <div key={`race-${entry.userId}`} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            <span
                              className={cn(
                                "pp-mono mr-2",
                                isFirst
                                  ? "text-[var(--leader)]"
                                  : "text-[var(--muted)]",
                              )}
                            >
                              #{entry.rank}
                            </span>
                            {entry.username}
                            {isCurrentUser ? " · you" : ""}
                            {isFirst ? " · leading" : ""}
                          </p>
                          {!isFirst && pointsBehindLeader > 0 ? (
                            <p className="mt-0.5 pl-8 text-xs text-[var(--muted)]">
                              {pointsBehindLeader} behind first
                            </p>
                          ) : null}
                        </div>
                        <p
                          className={cn(
                            "pp-mono shrink-0 text-sm font-medium",
                            isFirst
                              ? "text-[var(--leader)]"
                              : isCurrentUser
                                ? "text-[var(--chase)]"
                                : "text-white",
                          )}
                        >
                          {entry.points}
                        </p>
                      </div>
                      <div className="h-3.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isFirst
                              ? "bg-[var(--leader)]"
                              : isCurrentUser
                                ? "bg-[var(--chase)]"
                                : "bg-[var(--muted)]/55",
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <EmptyState message="No points yet. Finish a focus block to open the board." />
        )}
      </CardContent>
    </Card>
  );
}
