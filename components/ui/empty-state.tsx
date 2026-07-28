import { cn } from "@/lib/utils";

export function EmptyState({
  className,
  message,
}: {
  className?: string;
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-sm text-slate-400",
        className,
      )}
    >
      {message}
    </div>
  );
}
