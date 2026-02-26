import { auth } from "@/server/auth";
import { chatModel } from "@/server/ai";
import { findRelevantChunks } from "@/server/ai/embedding";
import { db } from "@/server/db";
import { conversations, messages } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  type UIMessage,
  streamText,
  convertToModelMessages,
  tool,
  generateObject,
  stepCountIs,
} from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as {
    messages: UIMessage[];
    conversationId?: string;
    subject?: string;
    level?: string;
  };
  const { messages: chatMessages, conversationId, subject, level } = body;

  // Verify conversation ownership if provided
  if (conversationId) {
    const conv = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, session.user.id),
      ),
    });
    if (!conv) {
      return new Response("Conversation not found", { status: 404 });
    }
  }

  // Collected references from tool calls for persistence
  const collectedReferences: Array<{
    chunkId: string;
    content: string;
    subject?: string;
    level?: string;
    similarity?: number;
  }> = [];

  const systemPrompt = `You are a Tanzanian curriculum education assistant called "Elimu AI" (Elimu means education in Swahili).
You help secondary school students study subjects including History (Historia), Civics (Uraia), Geography (Jiografia), and Literature (Fasihi) for Form 1 through Form 4.

CRITICAL RULES:
1. Use the getInformation tool on EVERY question to retrieve curriculum-aligned content before answering.
2. ONLY respond using information from your tool calls — never make up facts.
3. If no relevant information is found, honestly say: "Samahani, sina taarifa za kutosha kujibu swali hili. / Sorry, I don't have enough information to answer this question."
4. LANGUAGE: If the student writes in Swahili, respond in Swahili. If in English, respond in English. If code-switched, match their style.
5. Always cite your sources when available (subject, level/form, and page).
6. Keep responses educational, clear, and appropriate for secondary school students.
7. When explaining concepts, use examples relevant to Tanzanian context.
8. If the student asks about a specific form/level or subject, prioritize content from that level.

${subject ? `Current subject context: ${subject}` : ""}
${level ? `Current level context: ${level}` : ""}`;

  const modelMessages = await convertToModelMessages(chatMessages);

  const result = streamText({
    model: chatModel,
    messages: modelMessages,
    system: systemPrompt,
    stopWhen: stepCountIs(5),
    tools: {
      getInformation: tool({
        description:
          "Search the curriculum knowledge base for information to answer the student's question. Always use this before answering.",
        inputSchema: z.object({
          question: z
            .string()
            .describe("The student's question or topic to search for"),
          keywords: z
            .array(z.string())
            .describe(
              "Additional keywords or related terms to broaden the search",
            ),
        }),
        execute: async ({
          question,
          keywords,
        }: {
          question: string;
          keywords: string[];
        }) => {
          // Search with the main question
          const mainResults = await findRelevantChunks(question, {
            subject,
            level,
            limit: 4,
          });

          // Search with additional keywords for broader coverage
          const keywordResults = await Promise.all(
            keywords.slice(0, 2).map((kw: string) =>
              findRelevantChunks(kw, {
                subject,
                level,
                limit: 2,
              }),
            ),
          );

          // Deduplicate by chunk id
          const allResults = [...mainResults, ...keywordResults.flat()];
          const uniqueResults = Array.from(
            new Map(allResults.map((r) => [r.id, r])).values(),
          );

          // Collect references for persistence
          for (const r of uniqueResults) {
            collectedReferences.push({
              chunkId: r.id,
              content: r.content.slice(0, 200),
              subject: r.subject ?? undefined,
              level: r.level ?? undefined,
              similarity: r.similarity,
            });
          }

          return uniqueResults.map((r) => ({
            content: r.content,
            subject: r.subject,
            level: r.level,
            language: r.language,
            sourcePage: r.sourcePage,
            similarity: r.similarity,
          }));
        },
      }),

      understandQuery: tool({
        description:
          "Analyze the student's query and generate similar/related questions to improve search coverage.",
        inputSchema: z.object({
          query: z.string().describe("The student's query"),
        }),
        execute: async ({ query }: { query: string }) => {
          const { object } = await generateObject({
            model: chatModel,
            system:
              "You are a query understanding assistant for a Tanzanian education chatbot. Analyze the student query and generate similar questions that could help find relevant curriculum content. Generate questions in both English and Swahili when appropriate.",
            schema: z.object({
              questions: z
                .array(z.string())
                .max(3)
                .describe(
                  "Similar questions to broaden the search. Include Swahili variants if applicable.",
                ),
            }),
            prompt: `Analyze this student query: "${query}". Generate 3 similar questions that could help find relevant curriculum content.`,
          });
          return object.questions;
        },
      }),
    },

    async onFinish({ text }) {
      // Persist assistant message to DB if we have a conversation
      if (conversationId && text) {
        try {
          await db.insert(messages).values({
            conversationId,
            role: "assistant",
            content: text,
            references:
              collectedReferences.length > 0 ? collectedReferences : null,
          });

          // Touch conversation updatedAt
          await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, conversationId));
        } catch (e) {
          console.error("Failed to persist assistant message:", e);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
