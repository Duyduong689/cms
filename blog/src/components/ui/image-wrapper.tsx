import { cn } from "@/lib/utils";
import Image from "next/image";

export const ImageWrapper = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <Image src={src} alt={alt} fill className="object-cover"/>
    </div>
  );
};
