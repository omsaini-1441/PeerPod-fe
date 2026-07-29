import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-xl border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-[var(--border)] bg-white/[0.04] text-[var(--foreground)]",
      success:
        "border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)]",
      danger: "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[#ffb4ae]",
      warning: "border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--warning)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

export { Alert, alertVariants };
