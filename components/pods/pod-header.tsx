import { motion } from "framer-motion";
import { DoorOpen, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Score } from "@/components/ui/score";

interface PodHeaderProps {
  groupName: string;
  memberCount: number;
  currentStreak: number;
  focusingCount?: number;
  notice: string | null;
  onLeave: () => void;
  isMutating: boolean;
}

export function PodHeader({
  groupName,
  memberCount,
  currentStreak,
  focusingCount = 0,
  notice,
  onLeave,
  isMutating,
}: PodHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0 space-y-4">
        <div>
          <h1 className="pp-display text-4xl font-semibold text-white sm:text-5xl">
            {groupName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            {notice ??
              "Start a focus block, finish tasks, and watch today's board move."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-sm text-[var(--muted)]">
            <Score value={memberCount} className="text-white" />
            <span>members</span>
          </div>

          {focusingCount > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-sm text-[#d7f98a]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <Score value={focusingCount} />
              <span>focusing</span>
            </div>
          ) : null}

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-3 py-1.5 text-sm text-[var(--warning)]">
            <Flame className="h-3.5 w-3.5" />
            <Score value={currentStreak} />
            <span>d streak</span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onLeave}
        disabled={isMutating}
        className="shrink-0 self-start sm:self-auto"
      >
        <DoorOpen className="h-4 w-4" />
        Leave
      </Button>
    </motion.div>
  );
}
