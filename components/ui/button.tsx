import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-[var(--duration-med)] ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b0a] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] !text-[#0c1406] hover:bg-[#d4f87a] shadow-[0_0_0_1px_rgba(198,243,90,0.2)]",
        secondary:
          "border border-[var(--border-strong)] bg-white/[0.03] text-[var(--foreground)] hover:bg-white/[0.07] hover:border-white/20",
        accent:
          "bg-[var(--accent)] !text-[#0c1406] hover:bg-[#d4f87a]",
        danger:
          "bg-[#3a1716] text-[#ffb4ae] border border-[#ff7b72]/30 hover:bg-[#4a1d1c]",
        ghost:
          "font-medium text-[var(--muted)] hover:bg-white/5 hover:text-white",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
