/**
 * Shared curriculum constants used across the UI.
 * Add new subjects, levels or languages here — every dropdown picks them up automatically.
 */

export const SUBJECTS = [
  "History",
  "Civics",
  "Geography",
  "Literature",
  "Biology",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const LEVELS = ["Form 1", "Form 2", "Form 3", "Form 4"] as const;

export type Level = (typeof LEVELS)[number];

export const LANGUAGES = [
  { value: "sw", label: "Swahili" },
  { value: "en", label: "English" },
  { value: "mixed", label: "Mixed" },
] as const;

export type Language = (typeof LANGUAGES)[number]["value"];
