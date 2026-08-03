import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-[var(--border)] bg-white/[0.03] text-[var(--muted)]",
        accent:
          "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[#d7f98a]",
        warning:
          "border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--warning)]",
        danger:
          "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]",
        glow:
          "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[#d7f98a]",
        leader:
          "border-[var(--leader)]/25 bg-[var(--leader-soft)] text-[var(--leader)]",
        chase:
          "border-[var(--chase)]/25 bg-[var(--chase-soft)] text-[var(--chase)]",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
