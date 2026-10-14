import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <ComingSoon
      title="Create your account"
      description="Account creation is being built right now. It arrives with the authentication phase of the project."
      phase="Phase 2"
    />
  );
}
