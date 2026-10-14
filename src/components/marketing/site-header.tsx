import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { marketingNav, siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      {siteConfig.inDevelopment && (
        <div className="border-b bg-muted/60 px-4 py-1.5 text-center text-xs text-muted-foreground">
          ProfilePilot is in active development. Profile building tools are being added step by step.
        </div>
      )}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
