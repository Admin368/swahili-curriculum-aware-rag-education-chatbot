import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/env";

/**
 * OpenRouter provider for chat generation (gpt-4o-mini).
 * Uses the OpenAI-compatible API at openrouter.ai.
 */
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

/** Primary chat model — cost-effective with good multilingual (Swahili/English) support */
export const chatModel = openrouter("openai/gpt-4o-mini");

/**
 * OpenAI provider for embeddings (text-embedding-3-small).
 * Separate from OpenRouter since OpenRouter doesn't serve embedding endpoints.
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/** Embedding model — 1536 dimensions, strong multilingual support */
export const embeddingModel = openai.embedding("text-embedding-3-small");
