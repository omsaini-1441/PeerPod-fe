"use client";

import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { GridBackground } from "@/components/aceternity/grid-background";
import { HeroColorWash } from "@/components/aceternity/hero-color-wash";
import { InteractiveGrid } from "@/components/aceternity/interactive-grid";
import { Meteors } from "@/components/aceternity/meteors";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { Spotlight } from "@/components/aceternity/spotlight";
import { cn } from "@/lib/utils";

export type AtmosphereVariant = "hero" | "pods" | "room" | "app";

type SiteAtmosphereProps = {
  className?: string;
  variant?: AtmosphereVariant;
};

export function SiteAtmosphere({
  className,
  variant = "app",
}: SiteAtmosphereProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#090b0a]",
          className,
        )}
        aria-hidden
      >
        <HeroColorWash />
        <GridBackground className="opacity-55" />
        <BackgroundBeams tone="hero" className="opacity-80" />
        <SparklesCore density={56} speed={0.4} className="opacity-65" />
        <Meteors number={16} />
        <Spotlight size={640} color="rgba(198, 243, 90, 0.14)" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#090b0a_78%)]" />
      </div>
    );
  }

  if (variant === "pods") {
    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070908]",
          className,
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(18,24,20,0.9),#070908_70%)]" />
        <InteractiveGrid cellSize={52} glowRadius={170} className="opacity-90" />
        <SparklesCore
          density={18}
          speed={0.1}
          color="#c6f35a"
          className="opacity-25"
        />
        <Spotlight size={680} color="rgba(198, 243, 90, 0.08)" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#070908_82%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#070908] to-transparent" />
      </div>
    );
  }

  // room + app (login / register / profile): elegant Background Beams
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050505]",
        className,
      )}
      aria-hidden
    >
      <BackgroundBeams tone="elegant" className="opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,#050505_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(198,243,90,0.03),transparent_45%)]" />
    </div>
  );
}
