"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bolt, Crown, Sparkles } from "lucide-react";
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
    <section className="grid gap-10 py-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-8"
      >
        <Badge variant="glow" className="w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          Social productivity that actually stays focused
        </Badge>
        <div className="space-y-5">
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
            Finish the work because your pod can see the board move.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            PeerPod turns tasks, focus sessions, and streaks into a live pod loop.
            No fake badge economy. Just clear effort, visible momentum, and enough
            peer pressure to keep you honest.
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
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <Card className="border-white/10 bg-slate-900/70">
          <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Live pod board
              </p>
              <p className="text-lg font-semibold text-white">Exam Sprint</p>
            </div>
            <Badge variant="accent">
              <Bolt className="h-3.5 w-3.5" />
              3 focusing now
            </Badge>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: "Aarav", points: 18 },
              { rank: 2, name: "Mira", points: 15 },
              { rank: 3, name: "You", points: 14 },
            ].map((row, index) => (
              <motion.div
                key={row.rank}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.24, delay: 0.08 * index }}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-400/15 text-sm font-semibold text-indigo-200">
                    #{row.rank}
                  </div>
                  <div>
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-sm text-slate-400">Pod points this week</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    {row.rank === 1 ? <Crown className="h-4 w-4 text-amber-300" /> : null}
                    <p className="text-lg font-semibold text-white">{row.points}</p>
                  </div>
                </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm font-medium text-amber-100">Focus block active</p>
            <p className="mt-1 text-3xl font-semibold text-white">22:14</p>
            <p className="mt-2 text-sm text-slate-300">
              Keep the timer alive, finish the task, and the board shifts.
            </p>
          </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
