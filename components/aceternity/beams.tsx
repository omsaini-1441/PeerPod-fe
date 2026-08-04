import { cn } from "@/lib/utils";

type BeamsProps = {
  className?: string;
  /** hero = brand lime/gold; elegant = soft cool with a lime hint */
  tone?: "hero" | "elegant";
  /** unique per page placement so gradient ids never collide */
  idPrefix: string;
};

/**
 * Aceternity-style background beams, server-rendered.
 * Animation is pure CSS (stroke-dashoffset via .pp-beam), so the beams
 * paint with the first frame instead of popping in after hydration.
 */
export function Beams({ className, tone = "elegant", idPrefix }: BeamsProps) {
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
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {PATHS.map((path, index) => (
          <path
            key={index}
            d={path}
            pathLength={1}
            className="pp-beam"
            stroke={`url(#${idPrefix}-grad-${index % colors.length})`}
            strokeOpacity={tone === "elegant" ? 0.35 : 0.5}
            strokeWidth={tone === "elegant" ? 0.6 : 1}
            style={{
              animationDuration: `${9 + index * 1.1}s`,
              animationDelay: `-${index * 1.7}s`,
            }}
          />
        ))}
        <defs>
          {colors.map((color, index) => (
            <linearGradient
              key={index}
              id={`${idPrefix}-grad-${index}`}
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
];
