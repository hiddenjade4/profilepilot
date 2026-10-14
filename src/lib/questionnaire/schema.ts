import { z } from "zod";

// Every answer is optional here because the questionnaire is saved as the
// user goes. Which answers are *required* to finish lives in questions.ts.

const text = (max: number) => z.string().trim().max(max);

export const CAREER_STAGES = [
  "entering",
  "advancing",
  "changing",
  "returning",
] as const;

export const INDUSTRIES = [
  "technology",
  "healthcare",
  "finance",
  "education",
  "government",
  "retail",
  "manufacturing",
  "nonprofit",
  "hospitality",
  "media",
  "logistics",
  "other",
] as const;

export const IT_FOCUS_AREAS = [
  "windows",
  "macos",
  "microsoft_365",
  "active_directory",
  "networking",
  "hardware",
  "ticketing",
  "printers",
  "mobile_devices",
  "security_basics",
  "remote_support",
  "customer_service",
] as const;

export const IMPRESSIONS = [
  "reliable",
  "problem_solver",
  "people_focused",
  "leader",
  "detail_oriented",
  "creative",
] as const;

export const WRITING_STYLES = [
  "traditional",
  "confident",
  "technical",
  "creative",
  "conversational",
] as const;

export const answersSchema = z.object({
  targetRole: text(120).optional(),
  careerStage: z.enum(CAREER_STAGES).optional(),
  previousField: text(120).optional(),
  industries: z.array(z.enum(INDUSTRIES)).max(INDUSTRIES.length).optional(),
  strengths: z.array(text(60).min(1)).max(12).optional(),
  itFocusAreas: z
    .array(z.enum(IT_FOCUS_AREAS))
    .max(IT_FOCUS_AREAS.length)
    .optional(),
  certifications: text(500).optional(),
  itExamples: text(2000).optional(),
  impression: z.enum(IMPRESSIONS).optional(),
  shortTermGoals: text(1000).optional(),
  extraExperience: text(3000).optional(),
  writingStyle: z.enum(WRITING_STYLES).optional(),
});

export type Answers = z.infer<typeof answersSchema>;
export type AnswerKey = keyof Answers;

// What the browser sends when saving.
export const saveQuestionnaireSchema = z.object({
  answers: answersSchema,
  currentStep: z.string().max(64).nullable(),
  complete: z.boolean(),
});

export type SaveQuestionnaireInput = z.infer<typeof saveQuestionnaireSchema>;
