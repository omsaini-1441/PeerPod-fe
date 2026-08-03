"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minimize2, Play, CircleStop } from "lucide-react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface FocusTimerCardProps {
  elapsedLabel: string;
  activeSession: boolean;
  selectedTaskId: string;
  tasks: Task[];
  isMutating: boolean;
  dayCapReached?: boolean;
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
  dayCapReached = false,
  onSelectedTaskIdChange,
  onStart,
  onStop,
  onEnterZen,
}: FocusTimerCardProps) {
  const focusableTasks = tasks.filter((task) => task.status !== "DONE");
  const selectedTask = tasks.find((task) => String(task.id) === selectedTaskId);

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Focus arena</CardTitle>
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
              activeSession
                ? "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[#d7f98a]"
                : "border-[var(--border)] bg-white/[0.03] text-[var(--muted)]"
            }`}
          >
            {activeSession ? "Live" : "Idle"}
          </span>
        </div>
        <CardDescription>
          {dayCapReached
            ? "Day board is full — keep going for the pod vibe and your streak."
            : activeSession
              ? selectedTask
                ? `Locked on “${selectedTask.title}”. Stay in the block.`
                : "Your block is live. Enter zen for a calmer full-screen timer."
              : "Pick an open task, then start a timed focus block."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <motion.div
          key={activeSession ? "timer-active" : "timer-idle"}
          initial={{ opacity: 0.85, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-inset)] px-5 py-8"
        >
          {activeSession ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,243,90,0.1),_transparent_65%)]"
            />
          ) : null}
          <p className="relative text-sm text-[var(--muted)]">Elapsed</p>
          <p className="pp-mono relative mt-3 text-5xl font-medium tracking-tight text-white sm:text-6xl">
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
              Enter zen
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
  { text: "Stay fuckin hard.", attribution: "David Goggins" },
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
  { text: "No one is coming to save you. Get up.", attribution: "David Goggins" },
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
  { text: "Discipline equals freedom.", attribution: "Jocko Willink" },
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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050605]/95 px-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(198,243,90,0.12),_transparent_70%)] sm:h-[36rem] sm:w-[36rem]"
          />

          <motion.div
            className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <p className="text-sm text-[var(--muted)]">
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
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  className="px-2 text-base leading-7 text-[var(--muted)] sm:text-lg"
                >
                  “{quote.text}”
                  <footer className="mt-3 text-xs tracking-[0.18em] text-[var(--accent)]/80">
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
