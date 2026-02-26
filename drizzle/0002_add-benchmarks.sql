CREATE TABLE IF NOT EXISTS "curriculum-aware-rag-education-chatbot_benchmark" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(500) DEFAULT 'New Benchmark',
	"modelLeft" varchar(127) NOT NULL,
	"modelRight" varchar(127) NOT NULL,
	"conversationLeftId" varchar(255) NOT NULL,
	"conversationRightId" varchar(255) NOT NULL,
	"subject" varchar(63),
	"level" varchar(31),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum-aware-rag-education-chatbot_chunk" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"documentId" varchar(255),
	"chunkIndex" integer DEFAULT 0 NOT NULL,
	"content" text NOT NULL,
	"contentLength" integer DEFAULT 0 NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"subject" varchar(63),
	"level" varchar(31),
	"language" varchar(31),
	"sourcePage" varchar(31),
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum-aware-rag-education-chatbot_conversation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(500) DEFAULT 'New Chat',
	"subject" varchar(63),
	"level" varchar(31),
	"type" varchar(31) DEFAULT 'chat' NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum-aware-rag-education-chatbot_document" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"filename" text NOT NULL,
	"blobUrl" text,
	"fileSize" integer DEFAULT 0 NOT NULL,
	"mimeType" varchar(127) DEFAULT 'application/pdf',
	"subject" varchar(63),
	"level" varchar(31),
	"language" varchar(31) DEFAULT 'sw',
	"status" varchar(31) DEFAULT 'pending' NOT NULL,
	"chunkCount" integer DEFAULT 0 NOT NULL,
	"uploadedById" varchar(255),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum-aware-rag-education-chatbot_message" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"conversationId" varchar(255) NOT NULL,
	"role" varchar(31) NOT NULL,
	"content" text NOT NULL,
	"references" jsonb,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'curriculum-aware-rag-education-chatbot_user' AND column_name = 'isAdmin') THEN
    ALTER TABLE "curriculum-aware-rag-education-chatbot_user" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'curriculum-aware-rag-education-chatbot_conversation' AND column_name = 'type') THEN
    ALTER TABLE "curriculum-aware-rag-education-chatbot_conversation" ADD COLUMN "type" varchar(31) DEFAULT 'chat' NOT NULL;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_benchmark" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_benchmark_userId_curriculum-aware-rag-education-chatbot_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_benchmark" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_benchmark_conversationLeftId_curriculum-aware-rag-education-chatbot_conversation_id_fk" FOREIGN KEY ("conversationLeftId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_benchmark" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_benchmark_conversationRightId_curriculum-aware-rag-education-chatbot_conversation_id_fk" FOREIGN KEY ("conversationRightId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_chunk" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_chunk_documentId_curriculum-aware-rag-education-chatbot_document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_document"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_conversation" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_conversation_userId_curriculum-aware-rag-education-chatbot_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_document" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_document_uploadedById_curriculum-aware-rag-education-chatbot_user_id_fk" FOREIGN KEY ("uploadedById") REFERENCES "public"."curriculum-aware-rag-education-chatbot_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "curriculum-aware-rag-education-chatbot_message" ADD CONSTRAINT "curriculum-aware-rag-education-chatbot_message_conversationId_curriculum-aware-rag-education-chatbot_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."curriculum-aware-rag-education-chatbot_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bench_user_idx" ON "curriculum-aware-rag-education-chatbot_benchmark" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bench_deleted_idx" ON "curriculum-aware-rag-education-chatbot_benchmark" USING btree ("isDeleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bench_updated_idx" ON "curriculum-aware-rag-education-chatbot_benchmark" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunk_embedding_idx" ON "curriculum-aware-rag-education-chatbot_chunk" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunk_document_idx" ON "curriculum-aware-rag-education-chatbot_chunk" USING btree ("documentId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunk_subject_level_idx" ON "curriculum-aware-rag-education-chatbot_chunk" USING btree ("subject","level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conv_user_idx" ON "curriculum-aware-rag-education-chatbot_conversation" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conv_updated_idx" ON "curriculum-aware-rag-education-chatbot_conversation" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conv_type_idx" ON "curriculum-aware-rag-education-chatbot_conversation" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_status_idx" ON "curriculum-aware-rag-education-chatbot_document" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_subject_idx" ON "curriculum-aware-rag-education-chatbot_document" USING btree ("subject");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_uploaded_by_idx" ON "curriculum-aware-rag-education-chatbot_document" USING btree ("uploadedById");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "msg_conv_idx" ON "curriculum-aware-rag-education-chatbot_message" USING btree ("conversationId");