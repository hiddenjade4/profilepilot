import { LogOutIcon } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";

export async function UserMenu() {
  const user = await requireUser();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-56 truncate text-sm text-muted-foreground sm:inline">
        {user.email}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="lg">
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
