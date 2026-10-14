import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm">
            Helps you write a LinkedIn profile from your real experience. You
            review every word before you use it.
          </p>
        </div>
        <p className="max-w-md text-xs leading-relaxed">
          ProfilePilot is an independent project. It is not affiliated with,
          endorsed by, or connected to LinkedIn Corporation. LinkedIn is a
          trademark of LinkedIn Corporation. ProfilePilot never asks for your
          LinkedIn password and does not publish anything to your profile.
        </p>
      </div>
    </footer>
  );
}
