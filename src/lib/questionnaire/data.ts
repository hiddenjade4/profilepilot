import "server-only";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { answersSchema, type Answers } from "./schema";

export type QuestionnaireStatus = "not_started" | "in_progress" | "completed";

export type Questionnaire = {
  answers: Answers;
  currentStep: string | null;
  status: QuestionnaireStatus;
};

// Loads the signed-in user's questionnaire. Row Level Security means this
// query can only ever see the current user's row.
export async function getMyQuestionnaire(): Promise<Questionnaire> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("career_questionnaires")
    .select("answers, current_step, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load questionnaire", { code: error.code });
    throw new Error("We couldn't load your questionnaire. Please refresh.");
  }

  if (!data) {
    return { answers: {}, currentStep: null, status: "not_started" };
  }

  // Never trust stored JSON blindly: if its shape is outdated, start clean
  // rather than crash.
  const answers = answersSchema.safeParse(data.answers);
  return {
    answers: answers.success ? answers.data : {},
    currentStep: data.current_step,
    status: data.status === "completed" ? "completed" : "in_progress",
  };
}
