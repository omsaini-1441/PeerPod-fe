"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaHref = useMemo(
    () => (isAuthenticated ? "/pods" : "/register"),
    [isAuthenticated],
  );
  const ctaLabel = isAuthenticated ? "Open your pods" : "Create your account";

  return (
    <section className="grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-7"
      >
        <Badge variant="accent" className="w-fit normal-case tracking-normal">
          Social focus, visible effort
        </Badge>

        <div className="space-y-4">
          <h1 className="pp-display max-w-3xl text-5xl font-semibold text-white sm:text-6xl">
            PeerPod
          </h1>
          <p className="max-w-xl text-xl leading-8 text-[var(--muted)] sm:text-2xl">
            Finish the work because your pod can see the board move.
          </p>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            Tasks, focus sessions, and weekly ranks in one tight loop. No fake
            badge shop — just effort that shows.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">Already have an account</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        <Card className="border-[var(--accent)]/15 bg-[radial-gradient(circle_at_top,_rgba(198,243,90,0.1),_transparent_55%)]">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
                  Live board
                </p>
                <p className="pp-display mt-1 text-xl font-semibold text-white">
                  Exam Sprint
                </p>
              </div>
              <Badge variant="accent">3 focusing</Badge>
            </div>

            <div className="space-y-2">
              {[
                { rank: 1, name: "Aarav", points: 18 },
                { rank: 2, name: "Mira", points: 15 },
                { rank: 3, name: "You", points: 14 },
              ].map((row, index) => (
                <motion.div
                  key={row.rank}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: 0.06 * index }}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-black/25 px-3.5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="pp-mono w-7 text-sm text-[var(--muted)]">
                      #{row.rank}
                    </span>
                    <p className="font-medium text-white">{row.name}</p>
                  </div>
                  <p className="pp-mono text-white">{row.points}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
              <p className="text-sm text-[var(--warning)]">Focus block active</p>
              <p className="pp-mono mt-1 text-3xl text-white">22:14</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
