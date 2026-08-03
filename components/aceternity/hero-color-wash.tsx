"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Soft blurred color wash under hero beams — PeerPod palette. */
export function HeroColorWash({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <motion.div
        className="absolute -left-[20%] top-[-30%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(198,243,90,0.22)_0%,transparent_62%)] blur-[80px]"
        animate={{ x: [0, 50, -30, 0], y: [0, 40, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[25%] top-[5%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(245,215,110,0.14)_0%,transparent_65%)] blur-[90px]"
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-30%] left-[25%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(255,159,67,0.12)_0%,transparent_65%)] blur-[100px]"
        animate={{ x: [0, 25, -35, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
