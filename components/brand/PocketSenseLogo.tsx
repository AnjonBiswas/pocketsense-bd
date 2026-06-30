"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PocketSenseLogoProps = {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  textClassName?: string;
  priority?: boolean;
};

export function PocketSenseLogo({
  size = 44,
  showWordmark = true,
  subtitle,
  href,
  className,
  textClassName,
  priority = false
}: PocketSenseLogoProps) {
  const content = (
    <>
      <Image
        src="/logo.svg"
        alt="PocketSense logo"
        width={size}
        height={size}
        priority={priority}
        className="shrink-0"
      />
      {showWordmark ? (
        <div className={cn("min-w-0", textClassName)}>
          <p className="truncate text-sm font-semibold tracking-wide text-primary">PocketSense</p>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-3", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
}
