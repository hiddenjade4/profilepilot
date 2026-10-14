import type { AnswerKey, Answers } from "./schema";

// The questionnaire, as data. The wizard renders whatever is listed here, so
// adding or reordering a question is a change to this file only.

type Option = { value: string; label: string; description?: string };

type Base = {
  id: AnswerKey;
  title: string;
  description?: string;
  optional: boolean;
  // Conditional questions only appear when this returns true.
  showIf?: (answers: Answers) => boolean;
};

export type Question =
  | (Base & { kind: "text"; placeholder?: string; maxLength: number })
  | (Base & { kind: "textarea"; placeholder?: string; maxLength: number })
  | (Base & { kind: "single"; options: Option[] })
  | (Base & { kind: "multi"; options: Option[] })
  | (Base & {
      kind: "tags";
      placeholder?: string;
      maxItems: number;
      maxItemLength: number;
      suggestions?: string[];
    });

// Recognises IT support–style goals so we can ask more relevant questions.
const IT_ROLE_PATTERN =
  /\b(it|i\.t\.|help\s?desk|service\s?desk|desktop|tech(nical)?\s?support|technician|sys(tem)?s?\s?admin(istrator)?|network|support\s?specialist|computer)\b/i;

export function isItRole(targetRole: string | undefined): boolean {
  return Boolean(targetRole && IT_ROLE_PATTERN.test(targetRole));
}

export const questions: Question[] = [
  {
    id: "targetRole",
    kind: "text",
    title: "What kind of job are you looking for?",
    description: "A job title is perfect. You can be broad or specific.",
    placeholder: "e.g. IT Support Specialist",
    maxLength: 120,
    optional: false,
  },
  {
    id: "careerStage",
    kind: "single",
    title: "Which best describes where you are?",
    optional: false,
    options: [
      {
        value: "entering",
        label: "Starting my career",
        description: "Student, recent graduate, or first professional role",
      },
      {
        value: "advancing",
        label: "Moving up in my field",
        description: "Looking for a bigger role in the same area",
      },
      {
        value: "changing",
        label: "Changing careers",
        description: "Moving into a different field",
      },
      {
        value: "returning",
        label: "Returning to work",
        description: "Coming back after a break",
      },
    ],
  },
  {
    id: "previousField",
    kind: "text",
    title: "What field are you moving from?",
    description:
      "This helps us highlight skills that carry over to your new direction.",
    placeholder: "e.g. Retail management",
    maxLength: 120,
    optional: true,
    showIf: (a) => a.careerStage === "changing",
  },
  {
    id: "industries",
    kind: "multi",
    title: "Which industries interest you?",
    description: "Pick as many as you like.",
    optional: true,
    options: [
      { value: "technology", label: "Technology" },
      { value: "healthcare", label: "Healthcare" },
      { value: "finance", label: "Finance & banking" },
      { value: "education", label: "Education" },
      { value: "government", label: "Government" },
      { value: "retail", label: "Retail & e-commerce" },
      { value: "manufacturing", label: "Manufacturing" },
      { value: "nonprofit", label: "Nonprofit" },
      { value: "hospitality", label: "Hospitality" },
      { value: "media", label: "Media & marketing" },
      { value: "logistics", label: "Logistics & transport" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "strengths",
    kind: "tags",
    title: "What are your strongest professional skills?",
    description:
      "Type a skill and press Enter. Add the ones you'd be comfortable being asked about in an interview.",
    placeholder: "e.g. Troubleshooting",
    maxItems: 12,
    maxItemLength: 60,
    optional: false,
  },
  {
    id: "itFocusAreas",
    kind: "multi",
    title: "Which areas have you actually worked with?",
    description:
      "Only pick things you've done, whether at work, school, or at home. We'll ask about details later.",
    optional: true,
    showIf: (a) => isItRole(a.targetRole),
    options: [
      { value: "windows", label: "Windows" },
      { value: "macos", label: "macOS" },
      { value: "microsoft_365", label: "Microsoft 365" },
      { value: "active_directory", label: "Active Directory" },
      { value: "networking", label: "Networking & Wi-Fi" },
      { value: "hardware", label: "Hardware & repairs" },
      { value: "ticketing", label: "Ticketing systems" },
      { value: "printers", label: "Printers" },
      { value: "mobile_devices", label: "Phones & tablets" },
      { value: "security_basics", label: "Security basics" },
      { value: "remote_support", label: "Remote support" },
      { value: "customer_service", label: "Customer service" },
    ],
  },
  {
    id: "certifications",
    kind: "text",
    title: "Do you have any certifications, or are you working on one?",
    description:
      "Say whether each is earned or in progress, so we never list one you haven't finished.",
    placeholder: "e.g. CompTIA A+ (in progress, exam in June)",
    maxLength: 500,
    optional: true,
    showIf: (a) => isItRole(a.targetRole),
  },
  {
    id: "itExamples",
    kind: "textarea",
    title: "Any hands-on examples worth mentioning?",
    description:
      "A home lab, fixing devices for family, a tough support call you solved. Real examples make a profile stand out.",
    placeholder:
      "e.g. Set up a home network with a separate guest Wi-Fi and a Raspberry Pi ad blocker.",
    maxLength: 2000,
    optional: true,
    showIf: (a) => isItRole(a.targetRole),
  },
  {
    id: "impression",
    kind: "single",
    title: "What impression do you want to make?",
    description: "Pick the one that fits you best.",
    optional: true,
    options: [
      { value: "reliable", label: "Reliable and dependable" },
      { value: "problem_solver", label: "A sharp problem-solver" },
      { value: "people_focused", label: "Friendly and people-focused" },
      { value: "leader", label: "A strategic leader" },
      { value: "detail_oriented", label: "Detail-oriented and precise" },
      { value: "creative", label: "Creative and original" },
    ],
  },
  {
    id: "shortTermGoals",
    kind: "textarea",
    title: "What are your career goals for the next year or two?",
    placeholder:
      "e.g. Land my first full-time help desk role and earn my Network+.",
    maxLength: 1000,
    optional: true,
  },
  {
    id: "extraExperience",
    kind: "textarea",
    title: "Anything that's missing from your resume?",
    description:
      "Projects, volunteering, a side business, awards, or anything else you're proud of.",
    placeholder:
      "e.g. Volunteer at the public library's weekly tech help hour since 2024.",
    maxLength: 3000,
    optional: true,
  },
  {
    id: "writingStyle",
    kind: "single",
    title: "How should your profile sound?",
    description: "You can change this later for any section.",
    optional: false,
    options: [
      {
        value: "traditional",
        label: "Traditional",
        description: "Formal and polished",
      },
      {
        value: "confident",
        label: "Confident",
        description: "Direct and results-focused",
      },
      {
        value: "technical",
        label: "Technical",
        description: "Precise, with the right terminology",
      },
      {
        value: "creative",
        label: "Creative",
        description: "Distinctive, with personality",
      },
      {
        value: "conversational",
        label: "Conversational",
        description: "Warm and approachable, like talking to you",
      },
    ],
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return questions.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(answers: Answers, id: AnswerKey): boolean {
  const value = answers[id];
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

// Required questions (among those currently shown) that are still blank.
export function missingRequired(answers: Answers): AnswerKey[] {
  return visibleQuestions(answers)
    .filter((q) => !q.optional && !isAnswered(answers, q.id))
    .map((q) => q.id);
}

// Drop answers to questions that no longer apply. For example, if someone
// changes their target role from IT to marketing, their old IT answers
// shouldn't be saved or later used to write their profile.
export function pruneHiddenAnswers(answers: Answers): Answers {
  const visible = new Set(visibleQuestions(answers).map((q) => q.id));
  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => visible.has(key as AnswerKey)),
  ) as Answers;
}
