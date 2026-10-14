import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestionnaireWizard } from "@/components/questionnaire/wizard";
import { getMyQuestionnaire } from "@/lib/questionnaire/data";

export const metadata: Metadata = { title: "Career questionnaire" };

export default function OnboardingPage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <LoadedWizard />
    </Suspense>
  );
}

async function LoadedWizard() {
  const questionnaire = await getMyQuestionnaire();
  return (
    <QuestionnaireWizard
      initialAnswers={questionnaire.answers}
      initialStep={questionnaire.currentStep}
    />
  );
}

function WizardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8" aria-busy="true" aria-label="Loading questionnaire">
      <div className="h-6 animate-pulse rounded bg-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
