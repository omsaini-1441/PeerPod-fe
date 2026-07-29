import { AnimatePresence, motion } from "framer-motion";
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription className="mt-1">This week&apos;s points</CardDescription>
          </div>
          {leaderboard?.myRank ? (
            <Badge variant="accent">You #{leaderboard.myRank}</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        {leaderboard?.leaderboard.length ? (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {leaderboard.leaderboard.map((entry) => {
                const isCurrentUser = profile?.id === entry.userId;

                return (
                  <motion.div
                    key={`${entry.userId}-${entry.rank}-${entry.points}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-3",
                      isCurrentUser
                        ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-black/20",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="pp-mono w-8 text-sm text-[var(--muted)]">
                        #{entry.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {entry.username}
                          {isCurrentUser ? " · you" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="pp-mono shrink-0 text-base font-medium text-white">
                      {entry.points}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState message="No points yet. Finish a focus block to open the board." />
        )}
      </CardContent>
    </Card>
  );
}
