"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer tracking that writes CSS variables straight to the DOM.
 * No React state for continuous pointer values (skill rule 3.B):
 * zero re-renders, rAF-throttled. The layer stays invisible until the
 * first pointer move, so nothing pops in on page load.
 */
function usePointerVars(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const node = ref.current;
        if (!node) return;
        node.style.setProperty("--pp-x", `${event.clientX}px`);
        node.style.setProperty("--pp-y", `${event.clientY}px`);
        node.dataset.active = "true";
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref]);
}

type CursorGlowProps = {
  className?: string;
  size?: number;
  color?: string;
};

/** Soft radial glow that follows the cursor (full-viewport layers only). */
export function CursorGlow({
  className,
  size = 560,
  color = "rgba(198, 243, 90, 0.09)",
}: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 data-[active=true]:opacity-100",
        className,
      )}
      style={{
        background: `radial-gradient(${size}px circle at var(--pp-x, 50%) var(--pp-y, 35%), ${color}, transparent 60%)`,
      }}
    />
  );
}

type CursorGridGlowProps = {
  className?: string;
  cellSize?: number;
  radius?: number;
};

/**
 * Bright grid lines revealed around the cursor via a radial mask.
 * Layers over a static faint grid so the base paints instantly.
 */
export function CursorGridGlow({
  className,
  cellSize = 52,
  radius = 200,
}: CursorGridGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref);

  const mask = `radial-gradient(${radius}px circle at var(--pp-x, -999px) var(--pp-y, -999px), black 0%, transparent 75%)`;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 data-[active=true]:opacity-100",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(rgba(198,243,90,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(198,243,90,0.28) 1px, transparent 1px)",
        backgroundSize: `${cellSize}px ${cellSize}px`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}
