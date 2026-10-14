import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CompassIcon className="size-4" aria-hidden />
      </span>
      {siteConfig.name}
    </Link>
  );
}
