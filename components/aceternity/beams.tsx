"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type BeamsProps = {
  className?: string;
};

/**
 * Aceternity Background Beams defaults:
 * - grey rails
 * - short cyan→purple→violet gradient pulses riding the rails
 * - strokeWidth 0.5, sparse staggered travel
 */
export function Beams({ className }: BeamsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const pulses = Array.from(
      svg.querySelectorAll<SVGPathElement>("path[data-beam]"),
    );

    const runners = pulses.map((path, index) => {
      const length = path.getTotalLength();
      // Aceternity-scale streak: tiny comet, not a long line (~1.2% of path).
      const streak = Math.max(12, length * 0.012);
      path.style.strokeDasharray = `${streak} ${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = "0";

      return {
        path,
        length,
        streak,
        duration: 10000 + ((index * 1379) % 10000),
        delay: (index * 613) % 10000,
      };
    });

    let raf = 0;
    const start = performance.now();
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      for (const runner of runners) {
        const elapsed = now - start - runner.delay;
        if (elapsed < 0) {
          runner.path.style.opacity = "0";
          continue;
        }

        const cycle = elapsed % runner.duration;
        const travel = easeInOut(
          Math.min(1, cycle / (runner.duration * 0.9)),
        );
        const offset =
          runner.length - travel * (runner.length + runner.streak);

        runner.path.style.strokeDashoffset = `${offset}`;

        const fade =
          travel < 0.06
            ? travel / 0.06
            : travel > 0.92
              ? Math.max(0, (1 - travel) / 0.08)
              : 1;
        // Matches Aceternity strokeOpacity ~0.4
        runner.path.style.opacity = String(0.4 * fade);
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

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
        <defs>
          {/* PeerPod green beam gradient: darker → lighter accent */}
          <linearGradient id="pp-aceternity-beam" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop stopColor="#6b8f3a" stopOpacity="0" />
            <stop stopColor="#6b8f3a" />
            <stop offset="32.5%" stopColor="#a8c978" />
            <stop offset="100%" stopColor="#c6f35a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {PATHS.map((path, index) => (
          <path
            key={`rail-${index}`}
            d={path}
            stroke="rgba(238, 242, 234, 0.08)"
            strokeWidth={0.5}
          />
        ))}

        {PATHS.map((path, index) => (
          <path
            key={`beam-${index}`}
            data-beam=""
            d={path}
            stroke="url(#pp-aceternity-beam)"
            strokeWidth={0.5}
            strokeLinecap="round"
            fill="none"
          />
        ))}
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
