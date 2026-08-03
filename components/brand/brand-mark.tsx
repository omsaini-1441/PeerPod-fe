import Image from "next/image";
import { cn } from "@/lib/utils";
import { peerpodAssets } from "@/lib/assets";

type BrandMarkProps = {
  className?: string;
  size?: number;
};

export function BrandMark({ className, size = 32 }: BrandMarkProps) {
  return (
    <Image
      src={peerpodAssets.logo}
      alt="PeerPod"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[28%]", className)}
      priority
    />
  );
}
