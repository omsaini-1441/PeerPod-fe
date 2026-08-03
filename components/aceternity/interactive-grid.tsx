"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type InteractiveGridProps = {
  className?: string;
  cellSize?: number;
  glowRadius?: number;
};

/** Aceternity-style mouse-reactive grid — PeerPod lime / gold accents. */
export function InteractiveGrid({
  className,
  cellSize = 56,
  glowRadius = 160,
}: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      mouse.current.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellSize;
          const y = row * cellSize;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence =
            mouse.current.active && !reduced
              ? Math.max(0, 1 - dist / glowRadius)
              : 0;

          ctx.strokeStyle = `rgba(198, 243, 90, ${0.04 + influence * 0.28})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);

          if (influence > 0.05) {
            ctx.fillStyle = `rgba(198, 243, 90, ${influence * 0.1})`;
            ctx.fillRect(x + 1, y + 1, cellSize - 1, cellSize - 1);

            const gold = influence > 0.55;
            ctx.beginPath();
            ctx.fillStyle = gold
              ? `rgba(245, 215, 110, ${influence * 0.85})`
              : `rgba(198, 243, 90, ${influence * 0.7})`;
            ctx.arc(cx, cy, 1.2 + influence * 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [cellSize, glowRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    />
  );
}
