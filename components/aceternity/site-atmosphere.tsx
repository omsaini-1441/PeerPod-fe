"use client";

import { Beams } from "@/components/aceternity/beams";
import {
  CursorBlob,
  CursorGlow,
} from "@/components/aceternity/cursor-glow";
import { cn } from "@/lib/utils";

export type AtmosphereVariant = "hero" | "pods" | "room" | "app";

type SiteAtmosphereProps = {
  className?: string;
  variant?: AtmosphereVariant;
};

/**
 * Fixed page atmosphere. Lives at z-0 under main (z-10) — never -z-10,
 * which was painting behind the body background and killing effects.
 */
export function SiteAtmosphere({
  className,
  variant = "app",
}: SiteAtmosphereProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#090b0a]",
        className,
      )}
      aria-hidden
    >
      {variant === "hero" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_72%_-5%,rgba(198,243,90,0.11),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_12%_25%,rgba(245,215,110,0.06),transparent_70%)]" />
          <Beams tone="hero" className="opacity-90" />
          <CursorBlob size={480} />
          <CursorGlow size={640} color="rgba(198, 243, 90, 0.1)" />
        </>
      ) : null}

      {variant === "pods" ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(238,242,234,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(238,242,234,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(198,243,90,0.08),transparent_70%)]" />
          <CursorBlob size={460} />
          {/* Soft edge fade — keep center open so the blob stays visible */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(9,11,10,0.55)_100%)]" />
        </>
      ) : null}

      {variant === "room" || variant === "app" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_-5%,rgba(198,243,90,0.07),transparent_70%)]" />
          <Beams tone="elegant" className="opacity-90" />
          <CursorBlob size={400} />
        </>
      ) : null}
    </div>
  );
}
