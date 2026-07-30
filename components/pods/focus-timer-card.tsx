"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minimize2, Play, CircleStop } from "lucide-react";
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
  onEnterZen: () => void;
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
  onEnterZen,
}: FocusTimerCardProps) {
  const focusableTasks = tasks.filter((task) => task.status !== "DONE");
  const selectedTask = tasks.find((task) => String(task.id) === selectedTaskId);

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
            ? selectedTask
              ? `Locked on “${selectedTask.title}”. Stay in the block.`
              : "Your block is live. Enter zen mode for a calmer full-screen timer."
            : "Pick an open task, then start a timed focus block for this pod."}
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

        {!activeSession ? (
          <Select
            value={selectedTaskId}
            onChange={(event) => onSelectedTaskIdChange(event.target.value)}
          >
            <option value="">No linked task</option>
            {focusableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
                {task.status === "IN_PROGRESS" ? " · in progress" : ""}
              </option>
            ))}
          </Select>
        ) : null}

        {activeSession ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={onEnterZen}
              disabled={isMutating}
            >
              <Maximize2 className="h-4 w-4" />
              Enter zen mode
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={onStop}
              disabled={isMutating}
            >
              <CircleStop className="h-4 w-4" />
              Stop session
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={onStart} disabled={isMutating}>
            <Play className="h-4 w-4" />
            Start focus block
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

const PEAK_QUOTES: Array<{ text: string; attribution: string }> = [
  {
    text: "Stay fuckin hard.",
    attribution: "David Goggins",
  },
  {
    text: "Who's gonna carry the boats and the logs?",
    attribution: "David Goggins",
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    attribution: "David Goggins",
  },
  {
    text: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.",
    attribution: "David Goggins",
  },
  {
    text: "When you think you're done, you're only at 40% of what your body is capable of doing.",
    attribution: "David Goggins",
  },
  {
    text: "No one is coming to save you. Get up.",
    attribution: "David Goggins",
  },
  {
    text: "We suffer more in imagination than in reality.",
    attribution: "Seneca",
  },
  {
    text: "You could leave life right now. Let that determine what you do and say and think.",
    attribution: "Marcus Aurelius",
  },
  {
    text: "It is not death that a man should fear, but he should fear never beginning to live.",
    attribution: "Marcus Aurelius",
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    attribution: "Epictetus",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    attribution: "Marcus Aurelius",
  },
  {
    text: "A man dies twice — once when he stops, and again when the world forgets he ever fought.",
    attribution: "PeerPod",
  },
  {
    text: "Comfort is a slow death dressed like kindness.",
    attribution: "PeerPod",
  },
  {
    text: "Either you run the day or the day runs you.",
    attribution: "Jim Rohn",
  },
  {
    text: "Discipline equals freedom.",
    attribution: "Jocko Willink",
  },
  {
    text: "Most people quit at the exact moment the work starts becoming who they are.",
    attribution: "PeerPod",
  },
];

interface FocusZenModeProps {
  open: boolean;
  elapsedLabel: string;
  taskTitle?: string | null;
  isMutating: boolean;
  onClose: () => void;
  onStop: () => void;
}

export function FocusZenMode({
  open,
  elapsedLabel,
  taskTitle,
  isMutating,
  onClose,
  onStop,
}: FocusZenModeProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuoteIndex(Math.floor(Math.random() * PEAK_QUOTES.length));
    const interval = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % PEAK_QUOTES.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, [open]);

  const quote = PEAK_QUOTES[quoteIndex];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050605] px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(198,243,90,0.07),_transparent_70%)] sm:h-[42rem] sm:w-[42rem]"
              animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/15 bg-[radial-gradient(circle,_rgba(198,243,90,0.12),_transparent_72%)] sm:h-[30rem] sm:w-[30rem]"
              animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.65, 0.35] }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/25 bg-[radial-gradient(circle,_rgba(198,243,90,0.2),_transparent_70%)] sm:h-[18rem] sm:w-[18rem]"
              animate={{ scale: [1, 1.14, 1], opacity: [0.45, 0.85, 0.45] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>

          <motion.div
            className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-6">
              Focus mode
            </Badge>

            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--muted)]">
              {taskTitle ? "Working on" : "Open block"}
            </p>
            <h2 className="pp-display mt-2 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
              {taskTitle ?? "Stay with the work"}
            </h2>

            <p className="pp-mono mt-10 text-7xl font-medium tracking-tight text-white sm:text-8xl">
              {elapsedLabel}
            </p>

            <div className="mt-10 min-h-[6.5rem] w-full max-w-xl">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45 }}
                  className="px-2 text-base leading-7 text-[var(--muted)] sm:text-lg"
                >
                  “{quote.text}”
                  <footer className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--accent)]/80">
                    {quote.attribution}
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-white"
              >
                <Minimize2 className="h-4 w-4" />
                Minimize
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={isMutating}
                className="inline-flex items-center gap-2 text-sm text-[#ff9f98]/80 transition hover:text-[#ffb4ae] disabled:opacity-50"
              >
                <CircleStop className="h-4 w-4" />
                End focus
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
