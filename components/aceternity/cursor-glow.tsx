"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Tracks the pointer in viewport coords and writes CSS vars on the
 * target node. Always activates (seeded at center) so the glow is never
 * stuck at opacity 0 waiting for a mouse move.
 */
function usePointerFollow(
  ref: React.RefObject<HTMLDivElement | null>,
  lag = false,
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = lag && !reduce;
    let moveRaf = 0;
    let loopRaf = 0;
    let targetX = window.innerWidth * 0.55;
    let targetY = window.innerHeight * 0.4;
    let curX = targetX;
    let curY = targetY;

    const paint = () => {
      node.style.setProperty("--pp-x", `${curX}px`);
      node.style.setProperty("--pp-y", `${curY}px`);
      node.dataset.active = "true";
    };

    paint();

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!smooth) {
        curX = targetX;
        curY = targetY;
        if (!moveRaf) {
          moveRaf = window.requestAnimationFrame(() => {
            moveRaf = 0;
            paint();
          });
        }
      }
    };

    if (smooth) {
      const follow = () => {
        curX += (targetX - curX) * 0.14;
        curY += (targetY - curY) * 0.14;
        paint();
        loopRaf = window.requestAnimationFrame(follow);
      };
      loopRaf = window.requestAnimationFrame(follow);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(moveRaf);
      window.cancelAnimationFrame(loopRaf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref, lag]);
}

type CursorGlowProps = {
  className?: string;
  size?: number;
  color?: string;
};

/** Soft radial wash that follows the cursor. */
export function CursorGlow({
  className,
  size = 560,
  color = "rgba(198, 243, 90, 0.12)",
}: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerFollow(ref, false);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-80 data-[active=true]:opacity-100",
        className,
      )}
      style={{
        background: `radial-gradient(${size}px circle at var(--pp-x, 50%) var(--pp-y, 40%), ${color}, transparent 60%)`,
      }}
    />
  );
}

type CursorBlobProps = {
  className?: string;
  size?: number;
};

/** Blurred lime blob that chases the cursor with a soft lag. */
export function CursorBlob({ className, size = 420 }: CursorBlobProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerFollow(ref, true);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-90 data-[active=true]:opacity-100",
        className,
      )}
    >
      <div
        className="absolute left-0 top-0 will-change-transform rounded-full"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: "translate3d(var(--pp-x, 55vw), var(--pp-y, 40vh), 0)",
          background:
            "radial-gradient(circle, rgba(198,243,90,0.35) 0%, rgba(198,243,90,0.16) 42%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />
    </div>
  );
}
