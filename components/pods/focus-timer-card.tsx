import { motion } from "framer-motion";
import { Bolt, Play, Square } from "lucide-react";
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
    <Card className="overflow-hidden border-indigo-300/15 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(15,23,42,0.9)_45%)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge variant={activeSession ? "accent" : "glow"}>
              <Bolt className="h-3.5 w-3.5" />
              {activeSession ? "Live focus block" : "Ready to start"}
            </Badge>
            <CardTitle className="mt-3 text-3xl">Focus timer</CardTitle>
            <CardDescription className="mt-2">
              {activeSession
                ? "Your active session is running live against the pod board."
                : "Pick a task, start the block, and make your points count."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <motion.div
          key={activeSession ? "timer-active" : "timer-idle"}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: activeSession
              ? "0 0 0 1px rgba(52,211,153,0.18), 0 0 50px rgba(99,102,241,0.18)"
              : "0 0 0 1px rgba(255,255,255,0.06)",
          }}
          transition={{ duration: 0.3 }}
          className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Elapsed</p>
          <motion.p
            animate={activeSession ? { scale: [1, 1.012, 1] } : { scale: 1 }}
            transition={{ duration: 1.4, repeat: activeSession ? Infinity : 0 }}
            className="mt-3 text-5xl font-semibold tracking-tight text-white md:text-6xl"
          >
            {elapsedLabel}
          </motion.p>
        </motion.div>

        <Select value={selectedTaskId} onChange={(event) => onSelectedTaskIdChange(event.target.value)}>
          <option value="">No linked task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </Select>

        {activeSession ? (
          <Button variant="danger" className="w-full" onClick={onStop} disabled={isMutating}>
            <Square className="h-4 w-4" />
            Stop focus session
          </Button>
        ) : (
          <Button className="w-full" onClick={onStart} disabled={isMutating}>
            <Play className="h-4 w-4" />
            Start focus session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
