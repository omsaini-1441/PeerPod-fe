import { AnimatePresence, motion } from "framer-motion";
import { Crown, TrendingUp } from "lucide-react";
import type { LeaderboardResponse, Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface LeaderboardCardProps {
  leaderboard: LeaderboardResponse | null;
  profile: Profile | null;
}

export function LeaderboardCard({ leaderboard, profile }: LeaderboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="glow">
              <TrendingUp className="h-3.5 w-3.5" />
              Weekly race
            </Badge>
            <CardTitle className="mt-3">Leaderboard</CardTitle>
            <CardDescription className="mt-2">
              The board only moves when the work is real.
            </CardDescription>
          </div>
          {leaderboard?.myRank ? (
            <Badge variant="accent">Your rank #{leaderboard.myRank}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard?.leaderboard.length ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {leaderboard.leaderboard.map((entry, index) => {
                const isCurrentUser = profile?.id === entry.userId;
                const topThree = index < 3;

                return (
                  <motion.div
                    key={`${entry.userId}-${entry.rank}-${entry.points}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-400/15 text-sm font-semibold text-indigo-100">
                        #{entry.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{entry.username}</p>
                          {topThree ? <Crown className="h-4 w-4 text-amber-300" /> : null}
                        </div>
                        <p className="text-xs text-slate-400">
                          {isCurrentUser ? "You are here" : "Pod member"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{entry.points}</p>
                      <p className="text-xs text-slate-400">points</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState message="No points recorded yet." />
        )}
      </CardContent>
    </Card>
  );
}
