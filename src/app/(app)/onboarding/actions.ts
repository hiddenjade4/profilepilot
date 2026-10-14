"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { missingRequired, pruneHiddenAnswers } from "@/lib/questionnaire/questions";
import { saveQuestionnaireSchema } from "@/lib/questionnaire/schema";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveQuestionnaire(input: unknown): Promise<SaveResult> {
  const user = await requireUser();

  // The browser can send anything, so re-validate everything on the server.
  const parsed = saveQuestionnaireSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Some answers couldn't be saved. Check them and try again.",
    };
  }

  const answers = pruneHiddenAnswers(parsed.data.answers);

  if (parsed.data.complete && missingRequired(answers).length > 0) {
    return {
      ok: false,
      message: "A few required questions still need an answer.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("career_questionnaires").upsert(
    {
      user_id: user.id,
      answers,
      current_step: parsed.data.currentStep,
      // Only touch status when finishing, so editing a completed
      // questionnaire later doesn't mark it unfinished again.
      ...(parsed.data.complete && {
        status: "completed",
        completed_at: new Date().toISOString(),
      }),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    // Log the error code only — never the answers themselves.
    console.error("Failed to save questionnaire", { code: error.code });
    return {
      ok: false,
      message: "We couldn't save your answers. Check your connection and try again.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
