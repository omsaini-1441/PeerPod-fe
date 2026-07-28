"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function Home() {
  const { token } = useAuth();
  const ctaHref = useMemo(() => (token ? "/pods" : "/register"), [token]);
  const ctaLabel = token ? "Open your pods" : "Create your account";

  return (
    <section className="grid gap-10 py-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center lg:py-20">
      <div className="space-y-8">
        <div className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-100">
          Social productivity that actually stays focused
        </div>
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
          <Link
            href={ctaHref}
            className="rounded-full bg-indigo-500 px-6 py-3 text-center font-medium text-white transition hover:bg-indigo-400"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-6 py-3 text-center font-medium text-slate-200 transition hover:bg-white/5"
          >
            Already have an account
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Live pod board
              </p>
              <p className="text-lg font-semibold text-white">Exam Sprint</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
              3 focusing now
            </span>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: "Aarav", points: 18 },
              { rank: 2, name: "Mira", points: 15 },
              { rank: 3, name: "You", points: 14 },
            ].map((row) => (
              <div
                key={row.rank}
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
                <p className="text-lg font-semibold text-white">{row.points}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm font-medium text-amber-100">Focus block active</p>
            <p className="mt-1 text-3xl font-semibold text-white">22:14</p>
            <p className="mt-2 text-sm text-slate-300">
              Keep the timer alive, finish the task, and the board shifts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
