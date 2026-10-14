import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/auth/user-menu";

// Shared shell for every signed-in page. The header frame is static; only
// the part that reads the session (UserMenu) waits for the request.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Suspense
            fallback={<div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />}
          >
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
