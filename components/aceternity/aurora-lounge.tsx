"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Soft drifting aurora orbs — lounge / room vibe, not beams. */
export function AuroraLounge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <motion.div
        className="absolute -left-[15%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(198,243,90,0.16)_0%,transparent_68%)] blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[20%] top-[10%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(245,215,110,0.12)_0%,transparent_70%)] blur-3xl"
        animate={{ x: [0, -50, 15, 0], y: [0, 40, -15, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
      <motion.div
        className="absolute bottom-[-25%] left-[20%] h-[48vmax] w-[48vmax] rounded-full bg-[radial-gradient(circle,rgba(255,159,67,0.1)_0%,transparent_68%)] blur-3xl"
        animate={{ x: [0, 30, -25, 0], y: [0, -35, 20, 0], scale: [1, 1.1, 0.98, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
      />
      <motion.div
        className="absolute left-[35%] top-[35%] h-[28vmax] w-[28vmax] rounded-full bg-[radial-gradient(circle,rgba(143,153,143,0.08)_0%,transparent_70%)] blur-2xl"
        animate={{ opacity: [0.35, 0.65, 0.4, 0.35], scale: [0.95, 1.05, 1, 0.95] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
