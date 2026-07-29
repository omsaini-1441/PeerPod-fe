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
        "rounded-xl border border-dashed border-[var(--border-strong)] bg-black/15 px-4 py-8 text-center text-sm text-[var(--muted)]",
        className,
      )}
    >
      {message}
    </div>
  );
}
