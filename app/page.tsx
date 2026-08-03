"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Score } from "@/components/ui/score";

const boardRows = [
  { rank: 1, name: "Aarav", points: 18, width: 100, tone: "leader" as const },
  { rank: 2, name: "Mira", points: 15, width: 83, tone: "chase" as const },
  { rank: 3, name: "You", points: 14, width: 78, tone: "you" as const },
];

const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaHref = useMemo(
    () => (isAuthenticated ? "/pods" : "/register"),
    [isAuthenticated],
  );
  const ctaLabel = isAuthenticated ? "Open your pods" : "Create your account";

  return (
    <section className="relative grid min-h-[calc(100dvh-7rem)] items-center gap-12 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="space-y-8"
      >
        <div className="space-y-5">
          <h1 className="pp-display max-w-5xl text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[1.05] text-white">
            PeerPod
          </h1>
          <p className="max-w-xl text-xl leading-relaxed text-[var(--muted)] sm:text-2xl">
            Finish the work because your pod can see the board move.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="group">
            <Link href={ctaHref}>
              {ctaLabel}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                →
              </span>
            </Link>
          </Button>
          {!isAuthenticated ? (
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Sign in</Link>
            </Button>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.08 }}
      >
        <Card>
          <CardContent className="relative space-y-6 overflow-hidden p-6 sm:p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl"
            />

            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Live board</p>
                <p className="pp-display mt-1 text-2xl font-semibold text-white">
                  Exam Sprint
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-sm text-[#d7f98a]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                3 focusing
              </div>
            </div>

            <div className="space-y-3">
              {boardRows.map((row, index) => (
                <motion.div
                  key={row.rank}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.12 + index * 0.06 }}
                  className="space-y-2 rounded-2xl border border-[var(--border)] bg-black/20 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`pp-mono w-7 text-sm ${
                          row.tone === "leader"
                            ? "text-[var(--leader)]"
                            : row.tone === "you"
                              ? "text-[var(--accent)]"
                              : "text-[var(--chase)]"
                        }`}
                      >
                        #{row.rank}
                      </span>
                      <p className="font-medium text-white">{row.name}</p>
                    </div>
                    <Score value={row.points} className="text-white" suffix="pts" />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={`h-full rounded-full ${
                        row.tone === "leader"
                          ? "bg-[var(--leader)]"
                          : row.tone === "you"
                            ? "bg-[var(--accent)]"
                            : "bg-[var(--chase)]"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.width}%` }}
                      transition={{ ...spring, delay: 0.2 + index * 0.08 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-4">
              <div>
                <p className="text-sm text-[var(--muted)]">Focus block</p>
                <p className="pp-mono mt-1 text-3xl tracking-tight text-white">
                  22:14
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] shadow-[0_0_24px_var(--glow)]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
