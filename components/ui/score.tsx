"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

type ScoreProps = {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  compact?: boolean;
  decimals?: number;
};

export function Score({
  value,
  className,
  suffix,
  prefix,
  compact = false,
  decimals = 0,
}: ScoreProps) {
  return (
    <span
      className={cn(
        "pp-mono inline-flex items-baseline tabular-nums",
        className,
      )}
    >
      {prefix ? <span className="mr-0.5">{prefix}</span> : null}
      <NumberFlow
        value={value}
        trend={0}
        transformTiming={{
          duration: 450,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        spinTiming={{
          duration: 450,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        opacityTiming={{ duration: 200, easing: "ease-out" }}
        format={
          compact
            ? { notation: "compact", maximumFractionDigits: Math.max(decimals, 1) }
            : { maximumFractionDigits: decimals }
        }
      />
      {suffix ? <span className="ml-0.5 opacity-70">{suffix}</span> : null}
    </span>
  );
}
