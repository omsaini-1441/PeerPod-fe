"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type MeteorsProps = {
  number?: number;
  className?: string;
};

export function Meteors({ number = 14, className }: MeteorsProps) {
  const meteors = useMemo(
    () =>
      Array.from({ length: number }, (_, index) => ({
        id: index,
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${2.8 + Math.random() * 2.8}s`,
      })),
    [number],
  );

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="pp-meteor absolute h-0.5 w-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_1px_rgba(198,243,90,0.15)]"
          style={{
            top: meteor.top,
            left: meteor.left,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration,
          }}
        />
      ))}
    </div>
  );
}
