"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Swords, Trophy, Zap } from "lucide-react";
import { useMemo } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
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
    <section className="relative grid min-h-[calc(100dvh-7rem)] items-center gap-12 overflow-hidden py-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="relative z-10 space-y-8"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <BrandMark size={48} />
            <h1 className="pp-display text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[1.05] text-white">
              PeerPod
            </h1>
          </div>
          <p className="max-w-xl text-xl leading-relaxed text-[var(--muted)] sm:text-2xl">
            Finish the work because your pod can see the board move.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-[var(--leader)]" />
              Live race board
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
              Focus heat
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5">
              <Swords className="h-3.5 w-3.5 text-[var(--chase)]" />
              Pod competition
            </span>
          </div>
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
        className="relative z-10 space-y-4"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#0c0f0d]/80 p-1">
          <div className="relative overflow-hidden rounded-[calc(1.75rem-0.25rem)] border border-[var(--border)] bg-[#0a0c0b] px-5 py-6 sm:px-6">
            <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(198,243,90,0.08),transparent_65%)]" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-sm text-[var(--chase)]">
                    <Flame className="h-4 w-4" />
                    Arena preview
                  </p>
                  <p className="pp-display mt-1 text-2xl font-semibold text-white">
                    Rank climb simulation
                  </p>
                </div>
                <div className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-sm text-[#d7f98a]">
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Heat", value: "94%" },
                  { label: "Gap", value: "1 pt" },
                  { label: "Focus", value: "22:14" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[var(--border)] bg-black/35 px-3 py-3"
                  >
                    <p className="text-[11px] text-[var(--muted)]">{stat.label}</p>
                    <p className="pp-mono mt-1 text-lg text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[var(--muted)]">
                Not stock photos — a live competitive HUD of what your pod feels
                like when the board is moving.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="relative space-y-5 overflow-hidden p-5 sm:p-6">
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Race board</p>
                <p className="pp-display mt-1 text-xl font-semibold text-white">
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

            <div className="relative z-10 space-y-3">
              {boardRows.map((row, index) => (
                <motion.div
                  key={row.rank}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.12 + index * 0.06 }}
                  className="space-y-2"
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
                  <div className="pp-race-track">
                    <motion.div
                      className={`pp-race-fill ${
                        row.tone === "leader"
                          ? "pp-race-fill--leader"
                          : "pp-race-fill--chase"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.width}%` }}
                      transition={{ ...spring, delay: 0.2 + index * 0.08 }}
                    >
                      <span className="pp-race-sheen" aria-hidden />
                      <span
                        className={`pp-race-ember ${
                          row.tone === "leader"
                            ? "pp-race-ember--leader"
                            : "pp-race-ember--chase"
                        }`}
                        aria-hidden
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
