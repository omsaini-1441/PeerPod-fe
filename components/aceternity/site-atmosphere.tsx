import { Beams } from "@/components/aceternity/beams";
import {
  CursorGlow,
  CursorGridGlow,
} from "@/components/aceternity/cursor-glow";
import { cn } from "@/lib/utils";

export type AtmosphereVariant = "hero" | "pods" | "room" | "app";

type SiteAtmosphereProps = {
  className?: string;
  variant?: AtmosphereVariant;
};

/**
 * One atmosphere per page. The base is static CSS gradients that paint
 * with the first frame; the beams are server-rendered SVG animated by
 * pure CSS; the cursor layers stay invisible until the pointer moves.
 * Nothing pops in after hydration.
 */
export function SiteAtmosphere({
  className,
  variant = "app",
}: SiteAtmosphereProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#090b0a]",
        className,
      )}
      aria-hidden
    >
      {variant === "hero" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_72%_-5%,rgba(198,243,90,0.11),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_12%_25%,rgba(245,215,110,0.06),transparent_70%)]" />
          <Beams tone="hero" idPrefix="atmo-hero" className="opacity-70" />
          <CursorGlow size={620} color="rgba(198, 243, 90, 0.1)" />
        </>
      ) : null}

      {variant === "pods" ? (
        <>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(198,243,90,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(198,243,90,0.045) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <CursorGridGlow cellSize={52} radius={210} />
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(198,243,90,0.07),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#090b0a_88%)]" />
        </>
      ) : null}

      {variant === "room" || variant === "app" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_-5%,rgba(198,243,90,0.07),transparent_70%)]" />
          <Beams tone="elegant" idPrefix="atmo-app" className="opacity-80" />
        </>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.42)_100%)]" />
    </div>
  );
}
