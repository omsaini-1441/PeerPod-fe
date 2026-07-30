import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-[var(--border)] bg-white/[0.04] text-[var(--muted)]",
        accent:
          "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[#d7f98a]",
        warning: "border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--warning)]",
        danger: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
        glow:
          "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[#d7f98a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
