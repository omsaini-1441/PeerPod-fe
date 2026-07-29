import { motion } from "framer-motion";
import { DoorOpen, Flame, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PodHeaderProps {
  groupName: string;
  memberCount: number;
  currentStreak: number;
  notice: string | null;
  onLeave: () => void;
  isMutating: boolean;
}

export function PodHeader({
  groupName,
  memberCount,
  currentStreak,
  notice,
  onLeave,
  isMutating,
}: PodHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Live pod</Badge>
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <Users className="h-3.5 w-3.5" />
            {memberCount} members
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)]">
            <Flame className="h-3.5 w-3.5 text-[var(--warning)]" />
            {currentStreak}d streak
          </span>
        </div>

        <div>
          <h1 className="pp-display text-4xl font-semibold text-white sm:text-5xl">
            {groupName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            {notice ??
              "Start a focus block, finish tasks, and watch the weekly board move."}
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
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
