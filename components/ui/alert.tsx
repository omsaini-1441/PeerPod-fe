import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-2xl border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-white/10 bg-white/5 text-slate-200",
      success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
      danger: "border-rose-400/20 bg-rose-400/10 text-rose-200",
      warning: "border-amber-300/20 bg-amber-300/10 text-amber-100",
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
