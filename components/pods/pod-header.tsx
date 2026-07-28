import { motion } from "framer-motion";
import { DoorOpen, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="overflow-hidden">
      <CardContent className="relative p-6">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              <Badge variant="glow">Pod room</Badge>
              <Badge>
                <Users className="h-3.5 w-3.5" />
                {memberCount} inside
              </Badge>
              <Badge variant="warning">
                <Sparkles className="h-3.5 w-3.5" />
                {currentStreak} day streak
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">{groupName}</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Focus in public, finish what you claimed, and let the weekly board
                reflect it.
              </p>
            </div>
            <motion.p
              key={notice ?? "default-notice"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl text-sm text-indigo-100/80"
            >
              {notice ?? "Momentum is built in visible blocks, not noisy gimmicks."}
            </motion.p>
          </motion.div>

          <Button variant="secondary" onClick={onLeave} disabled={isMutating}>
            <DoorOpen className="h-4 w-4" />
            Leave pod
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
