"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BackgroundBeamsProps = {
  className?: string;
  /** hero = brighter brand hues; elegant = soft cool Aceternity-style */
  tone?: "hero" | "elegant";
};

export function BackgroundBeams({
  className,
  tone = "elegant",
}: BackgroundBeamsProps) {
  const uid = useId().replace(/:/g, "");
  const colors =
    tone === "hero"
      ? ["#c6f35a", "#f5d76e", "#a8c978"]
      : ["#8b9cb3", "#a7b8c9", "#c6f35a"];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g clipPath={`url(#${uid}-clip)`}>
          {PATHS.map((path, index) => (
            <motion.path
              key={`${uid}-${index}`}
              d={path}
              stroke={`url(#${uid}-grad-${index % colors.length})`}
              strokeOpacity={tone === "elegant" ? 0.35 : 0.5}
              strokeWidth={tone === "elegant" ? 0.6 : 1}
              initial={{ pathLength: 0.2, opacity: 0.15 }}
              animate={{
                pathLength: [0.15, 1, 0.35, 1],
                opacity: [0.12, 0.55, 0.2, 0.45],
              }}
              transition={{
                duration: 10 + index * 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.45,
              }}
            />
          ))}
        </g>
        <defs>
          <clipPath id={`${uid}-clip`}>
            <rect width="696" height="316" fill="white" />
          </clipPath>
          {colors.map((color, index) => (
            <linearGradient
              key={`${uid}-g-${index}`}
              id={`${uid}-grad-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}

const PATHS = [
  "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
  "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
  "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
  "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
  "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
  "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
  "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
  "M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819",
  "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
  "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
  "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
  "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
  "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
  "M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771",
  "M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763",
];
