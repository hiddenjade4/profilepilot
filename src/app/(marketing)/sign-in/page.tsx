import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <ComingSoon
      title="Sign in"
      description="Accounts are being built right now. Sign-in arrives with the authentication phase of the project."
      phase="Phase 2"
    />
  );
}
