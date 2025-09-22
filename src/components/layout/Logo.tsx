
import { cn } from "@/lib/utils";
import Image from "next/image";
import logoImage from "./logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={logoImage}
      alt="Logo"
      className={cn(className)}
      width={500}
      height={500}
      priority
    />
  );
}
