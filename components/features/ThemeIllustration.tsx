"use client";

import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeIllustration({
  lightSrc,
  darkSrc,
  alt,
  className = ""
}: {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? darkSrc : lightSrc;

  return (
    <Image src={src} alt={alt} width={960} height={960} className={className} />
  );
}
