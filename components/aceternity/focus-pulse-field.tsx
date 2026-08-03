"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type FocusPulseFieldProps = {
  className?: string;
};

/**
 * Inside-pod vibe: concentric focus pulses + drifting nodes.
 * Feels like a live arena / radar, not the pods grid or home beams.
 */
export function FocusPulseField({ className }: FocusPulseFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let t = 0;

    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
    }));

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

    const draw = () => {
      t += reduced ? 0 : 0.008;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.42;

      for (let i = 0; i < 5; i += 1) {
        const pulse = ((t * 0.35 + i * 0.2) % 1);
        const radius = 40 + pulse * Math.min(width, height) * 0.42;
        const alpha = (1 - pulse) * 0.22;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(245, 215, 110, ${alpha})`;
        ctx.lineWidth = 1.25;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(198, 243, 90, 0.12)";
      ctx.arc(cx, cy, 6 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "rgba(245, 215, 110, 0.55)";
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      for (const node of nodes) {
        const nx = node.x * width + Math.sin(t * node.speed + node.phase) * 12;
        const ny = node.y * height + Math.cos(t * node.speed * 0.8 + node.phase) * 10;
        const glow = 0.25 + 0.35 * Math.sin(t * 1.5 + node.phase);

        ctx.beginPath();
        ctx.fillStyle = `rgba(198, 243, 90, ${glow * 0.55})`;
        ctx.arc(nx, ny, node.r, 0, Math.PI * 2);
        ctx.fill();

        const dx = nx - cx;
        const dy = ny - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < Math.min(width, height) * 0.38) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 159, 67, ${0.08 * (1 - dist / (Math.min(width, height) * 0.38))})`;
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    />
  );
}
