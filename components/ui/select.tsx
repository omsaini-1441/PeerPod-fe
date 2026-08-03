import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-11 w-full appearance-none rounded-full border border-[var(--border)] bg-black/25 px-4 py-3 pr-10 text-sm text-white outline-none transition-colors duration-[var(--duration-med)] ease-[var(--ease-out-expo)] focus:border-[var(--accent)]/40 focus:bg-black/35",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
