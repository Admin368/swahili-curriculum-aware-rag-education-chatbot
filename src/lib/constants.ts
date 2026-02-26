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

export type MODELS_NAMES =
  | "gpt_4o_mini"
  | "qwen_2_5_7b_instruct"
  | "gemma_3_12b_it"
  | "gpt_4o";
export const MODELS: Record<MODELS_NAMES, { key: string; label: string }> = {
  gpt_4o_mini: { key: "gpt-4o-mini", label: "GPT-4o Mini" },
  qwen_2_5_7b_instruct: {
    key: "qwen/qwen-2.5-7b-instruct",
    label: "Qwen 2.5 7B Instruct",
  },
  gemma_3_12b_it: {
    key: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B IT (Google Gemini)",
  },
  gpt_4o: { key: "openai/gpt-4o", label: "GPT-4o" },
};
