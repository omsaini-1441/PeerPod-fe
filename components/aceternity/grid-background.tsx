"use client";

import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  className?: string;
  fade?: boolean;
};

export function GridBackground({ className, fade = true }: GridBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(198, 243, 90, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(198, 243, 90, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: fade
            ? "radial-gradient(ellipse at center, black 28%, transparent 75%)"
            : undefined,
          WebkitMaskImage: fade
            ? "radial-gradient(ellipse at center, black 28%, transparent 75%)"
            : undefined,
        }}
      />
      <div className="pp-grid-scan absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgba(198,243,90,0.08)] to-transparent opacity-60" />
    </div>
  );
}
