import Link from "next/link";
import { ArrowLeftIcon, ConstructionIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type ComingSoonProps = {
  title: string;
  description: string;
  phase: string;
};

// Shown for routes that are linked from the UI but not built yet, so no
// button pretends to work. Each page using this is replaced in its phase.
export function ComingSoon({ title, description, phase }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ConstructionIcon className="size-5 text-muted-foreground" aria-hidden />
      </span>
      <p className="text-xs font-medium tracking-wide text-primary uppercase">
        Not available yet · {phase}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
        <ArrowLeftIcon data-icon="inline-start" />
        Back to home
      </Link>
    </div>
  );
}
