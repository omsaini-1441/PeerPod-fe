import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-slate-200",
        accent: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
        warning: "border-amber-300/20 bg-amber-300/10 text-amber-100",
        danger: "border-rose-300/20 bg-rose-300/10 text-rose-200",
        glow: "border-indigo-300/20 bg-indigo-300/10 text-indigo-100",
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
