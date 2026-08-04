"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BeamsProps = {
  className?: string;
  tone?: "hero" | "elegant";
};

/**
 * Aceternity Background Beams.
 * Grey rails paint immediately. Traveling pulses start after mount and
 * animate gradient x1/y1/x2/y2 via rAF (the official technique, without
 * relying on motion.linearGradient which was failing silently here).
 */
export function Beams({ className, tone = "elegant" }: BeamsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);
  const pulseColors: [string, string, string] =
    tone === "hero"
      ? ["#c6f35a", "#f5d76e", "#ff9f43"]
      : ["#c6f35a", "#a8c978", "#f5d76e"];

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rand = (seed: number) => Math.abs(Math.sin(seed) * 10000) % 1;
    const gradients = Array.from(
      svg.querySelectorAll<SVGLinearGradientElement>("linearGradient[data-pulse]"),
    );

    const pulses = gradients.map((el, index) => ({
      el,
      duration: (10 + rand(index + 2) * 10) * 1000,
      delay: rand(index + 3) * 8 * 1000,
      yEnd: 93 + rand(index + 1) * 8,
    }));

    let raf = 0;
    const start = performance.now();
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      for (const pulse of pulses) {
        const elapsed = now - start - pulse.delay;
        if (elapsed < 0) continue;
        const t = easeInOut((elapsed % pulse.duration) / pulse.duration);
        const p = t * 100;
        pulse.el.setAttribute("x1", `${p}%`);
        pulse.el.setAttribute("x2", `${Math.max(0, p - 5)}%`);
        pulse.el.setAttribute("y1", `${p}%`);
        pulse.el.setAttribute("y2", `${t * pulse.yEnd}%`);
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [ready, tone]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {PATHS.map((path, index) => (
          <path
            key={`rail-${index}`}
            d={path}
            stroke="rgba(238, 242, 234, 0.08)"
            strokeWidth={0.5}
          />
        ))}

        {ready
          ? PATHS.map((path, index) => (
              <path
                key={`pulse-${index}`}
                d={path}
                stroke={`url(#pp-beam-${tone}-${index})`}
                strokeOpacity="0.6"
                strokeWidth="0.7"
              />
            ))
          : null}

        <defs>
          {PATHS.map((_, index) => (
            <linearGradient
              key={`g-${index}`}
              id={`pp-beam-${tone}-${index}`}
              data-pulse=""
              x1="0%"
              x2="0%"
              y1="0%"
              y2="0%"
            >
              <stop stopColor={pulseColors[0]} stopOpacity="0" />
              <stop stopColor={pulseColors[0]} />
              <stop offset="32.5%" stopColor={pulseColors[1]} />
              <stop offset="100%" stopColor={pulseColors[2]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}

const PATHS = Array.from({ length: 50 }, (_, i) => {
  const x = 7 * i;
  const y = -8 * i;
  return (
    `M${-380 + x} ${-189 + y}` +
    `C${-380 + x} ${-189 + y} ${-312 + x} ${216 + y} ${152 + x} ${343 + y}` +
    `C${616 + x} ${470 + y} ${684 + x} ${875 + y} ${684 + x} ${875 + y}`
  );
});
