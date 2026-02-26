import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { nanoid } from "nanoid";

/**
 * Multi-project schema prefix.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `curriculum-aware-rag-education-chatbot_${name}`,
);

// ---------------------------------------------------------------------------
// Auth tables (existing)
// ---------------------------------------------------------------------------

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull().unique(),
  emailVerified: d.timestamp({
    mode: "date",
    withTimezone: true,
  }),
  image: d.varchar({ length: 255 }),
  passwordHash: d.varchar({ length: 255 }),
  isAdmin: d.boolean().notNull().default(false),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  conversations: many(conversations),
  documents: many(documents),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

// ---------------------------------------------------------------------------
// Documents — admin-uploaded curriculum materials
// ---------------------------------------------------------------------------

export const documents = createTable(
  "document",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: d.text().notNull(),
    filename: d.text().notNull(),
    blobUrl: d.text(),
    fileSize: d.integer().notNull().default(0),
    mimeType: d.varchar({ length: 127 }).default("application/pdf"),
    subject: d.varchar({ length: 63 }),
    level: d.varchar({ length: 31 }),
    language: d.varchar({ length: 31 }).default("sw"),
    status: d
      .varchar({ length: 31 })
      .notNull()
      .default("pending")
      .$type<"pending" | "processing" | "ready" | "error">(),
    chunkCount: d.integer().notNull().default(0),
    uploadedById: d.varchar({ length: 255 }).references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("doc_status_idx").on(t.status),
    index("doc_subject_idx").on(t.subject),
    index("doc_uploaded_by_idx").on(t.uploadedById),
  ],
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
  chunks: many(chunks),
}));

// ---------------------------------------------------------------------------
// Chunks — text chunks with vector embeddings (pgvector)
// ---------------------------------------------------------------------------

export const chunks = createTable(
  "chunk",
  (d) => ({
    id: d
      .varchar({ length: 191 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    documentId: d
      .varchar({ length: 255 })
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: d.integer().notNull().default(0),
    content: d.text().notNull(),
    contentLength: d.integer().notNull().default(0),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    subject: d.varchar({ length: 63 }),
    level: d.varchar({ length: 31 }),
    language: d.varchar({ length: 31 }),
    sourcePage: d.varchar({ length: 31 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("chunk_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    index("chunk_document_idx").on(t.documentId),
    index("chunk_subject_level_idx").on(t.subject, t.level),
  ],
);

export const chunksRelations = relations(chunks, ({ one }) => ({
  document: one(documents, {
    fields: [chunks.documentId],
    references: [documents.id],
  }),
}));

// ---------------------------------------------------------------------------
// Conversations — chat sessions
// ---------------------------------------------------------------------------

export const conversations = createTable(
  "conversation",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 500 }).default("New Chat"),
    subject: d.varchar({ length: 63 }),
    level: d.varchar({ length: 31 }),
    type: d
      .varchar({ length: 31 })
      .notNull()
      .default("chat")
      .$type<"chat" | "benchmark">(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("conv_user_idx").on(t.userId),
    index("conv_updated_idx").on(t.updatedAt),
    index("conv_type_idx").on(t.type),
  ],
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

// ---------------------------------------------------------------------------
// Benchmarks — side-by-side model comparison sessions
// ---------------------------------------------------------------------------

export const benchmarks = createTable(
  "benchmark",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 500 }).default("New Benchmark"),
    modelLeft: d.varchar({ length: 127 }).notNull(),
    modelRight: d.varchar({ length: 127 }).notNull(),
    conversationLeftId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    conversationRightId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    subject: d.varchar({ length: 63 }),
    level: d.varchar({ length: 31 }),
    isDeleted: d.boolean().notNull().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("bench_user_idx").on(t.userId),
    index("bench_deleted_idx").on(t.isDeleted),
    index("bench_updated_idx").on(t.updatedAt),
  ],
);

export const benchmarksRelations = relations(benchmarks, ({ one }) => ({
  user: one(users, {
    fields: [benchmarks.userId],
    references: [users.id],
  }),
  conversationLeft: one(conversations, {
    fields: [benchmarks.conversationLeftId],
    references: [conversations.id],
    relationName: "benchmarkLeft",
  }),
  conversationRight: one(conversations, {
    fields: [benchmarks.conversationRightId],
    references: [conversations.id],
    relationName: "benchmarkRight",
  }),
}));

// ---------------------------------------------------------------------------
// Messages — individual chat messages
// ---------------------------------------------------------------------------

export const messages = createTable(
  "message",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    conversationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: d
      .varchar({ length: 31 })
      .notNull()
      .$type<"user" | "assistant" | "system">(),
    content: d.text().notNull(),
    references: d.jsonb().$type<
      Array<{
        chunkId: string;
        content: string;
        subject?: string;
        level?: string;
        similarity?: number;
      }>
    >(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("msg_conv_idx").on(t.conversationId)],
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
