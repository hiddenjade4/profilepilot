import { describe, expect, it } from "vitest";
import {
  isItRole,
  missingRequired,
  pruneHiddenAnswers,
  visibleQuestions,
} from "@/lib/questionnaire/questions";
import { answersSchema, saveQuestionnaireSchema } from "@/lib/questionnaire/schema";

const ids = (answers: Parameters<typeof visibleQuestions>[0]) =>
  visibleQuestions(answers).map((q) => q.id);

describe("conditional questions", () => {
  it("recognises IT support style job titles", () => {
    for (const role of [
      "IT Support Specialist",
      "Help Desk Technician",
      "Service Desk Analyst",
      "Junior Systems Administrator",
      "Desktop Support",
    ]) {
      expect(isItRole(role), role).toBe(true);
    }
  });

  it("does not treat unrelated roles as IT", () => {
    for (const role of ["Marketing Coordinator", "Registered Nurse", "Accountant", ""]) {
      expect(isItRole(role), role).toBe(false);
    }
  });

  it("shows IT questions only for IT roles", () => {
    expect(ids({ targetRole: "Help Desk Technician" })).toContain("itFocusAreas");
    expect(ids({ targetRole: "Marketing Coordinator" })).not.toContain("itFocusAreas");
  });

  it("asks for the previous field only when changing careers", () => {
    expect(ids({ careerStage: "changing" })).toContain("previousField");
    expect(ids({ careerStage: "advancing" })).not.toContain("previousField");
  });
});

describe("required answers", () => {
  it("lists every required question for an empty questionnaire", () => {
    expect(missingRequired({})).toEqual([
      "targetRole",
      "careerStage",
      "strengths",
      "writingStyle",
    ]);
  });

  it("treats blank text and empty lists as unanswered", () => {
    expect(missingRequired({ targetRole: "   ", strengths: [] })).toContain("targetRole");
    expect(missingRequired({ targetRole: "   ", strengths: [] })).toContain("strengths");
  });

  it("is satisfied once all required questions are answered", () => {
    expect(
      missingRequired({
        targetRole: "Help Desk Technician",
        careerStage: "entering",
        strengths: ["Troubleshooting"],
        writingStyle: "conversational",
      }),
    ).toEqual([]);
  });
});

describe("pruneHiddenAnswers", () => {
  it("drops answers to questions that no longer apply", () => {
    const pruned = pruneHiddenAnswers({
      targetRole: "Marketing Coordinator", // was an IT role earlier
      itFocusAreas: ["windows"],
      certifications: "CompTIA A+",
      careerStage: "advancing", // was "changing" earlier
      previousField: "Retail",
    });
    expect(pruned).toEqual({
      targetRole: "Marketing Coordinator",
      careerStage: "advancing",
    });
  });

  it("keeps answers that still apply", () => {
    const answers = { targetRole: "IT Support", itFocusAreas: ["windows" as const] };
    expect(pruneHiddenAnswers(answers)).toEqual(answers);
  });
});

describe("answer validation", () => {
  it("trims text answers", () => {
    expect(answersSchema.parse({ targetRole: "  Analyst  " }).targetRole).toBe("Analyst");
  });

  it("rejects options that aren't on the list", () => {
    expect(answersSchema.safeParse({ careerStage: "ceo_tomorrow" }).success).toBe(false);
    expect(answersSchema.safeParse({ industries: ["crypto-casinos"] }).success).toBe(false);
  });

  it("rejects over-long answers", () => {
    expect(answersSchema.safeParse({ targetRole: "x".repeat(121) }).success).toBe(false);
    expect(
      answersSchema.safeParse({ strengths: Array.from({ length: 13 }, (_, i) => `s${i}`) })
        .success,
    ).toBe(false);
  });

  it("strips unknown fields instead of saving them", () => {
    const parsed = answersSchema.parse({ targetRole: "Analyst", isAdmin: true });
    expect(parsed).toEqual({ targetRole: "Analyst" });
  });

  it("requires the save payload to have the right shape", () => {
    expect(saveQuestionnaireSchema.safeParse({ answers: {} }).success).toBe(false);
    expect(
      saveQuestionnaireSchema.safeParse({ answers: {}, currentStep: null, complete: false })
        .success,
    ).toBe(true);
  });
});
