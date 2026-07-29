import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import type { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface FocusTimerCardProps {
  elapsedLabel: string;
  activeSession: boolean;
  selectedTaskId: string;
  tasks: Task[];
  isMutating: boolean;
  onSelectedTaskIdChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
}

export function FocusTimerCard({
  elapsedLabel,
  activeSession,
  selectedTaskId,
  tasks,
  isMutating,
  onSelectedTaskIdChange,
  onStart,
  onStop,
}: FocusTimerCardProps) {
  return (
    <Card className="relative overflow-hidden border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top,_rgba(198,243,90,0.12),_transparent_55%)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Focus timer</CardTitle>
          <Badge variant={activeSession ? "accent" : "default"}>
            {activeSession ? "Live" : "Idle"}
          </Badge>
        </div>
        <CardDescription>
          {activeSession
            ? "Your block is live. Keep this screen open and finish the work you claimed."
            : "Choose the task you want to ship, then start a timed focus block for this pod."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <motion.div
          key={activeSession ? "timer-active" : "timer-idle"}
          initial={{ opacity: 0.85, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-black/30 px-5 py-6"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
            Elapsed
          </p>
          <p className="pp-mono mt-3 text-5xl font-medium tracking-tight text-white sm:text-6xl">
            {elapsedLabel}
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              1. Pick task
            </p>
            <p className="mt-1 text-sm text-white">Tie the session to the work that matters.</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              2. Focus
            </p>
            <p className="mt-1 text-sm text-white">Stay in the block and build real momentum.</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              3. Move board
            </p>
            <p className="mt-1 text-sm text-white">Completed blocks feed points and streaks.</p>
          </div>
        </div>

        <Select
          value={selectedTaskId}
          onChange={(event) => onSelectedTaskIdChange(event.target.value)}
          disabled={activeSession}
        >
          <option value="">No linked task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </Select>

        {activeSession ? (
          <Button
            variant="danger"
            className="w-full"
            onClick={onStop}
            disabled={isMutating}
          >
            <Square className="h-4 w-4" />
            Stop session
          </Button>
        ) : (
          <Button className="w-full" onClick={onStart} disabled={isMutating}>
            <Play className="h-4 w-4" />
            Start session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
