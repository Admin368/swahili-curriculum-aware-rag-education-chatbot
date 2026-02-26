/**
 * Enable pgvector extension on Neon database.
 * Run: npx tsx src/scripts/enable-pgvector.ts
 */
import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = postgres(url);
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  console.log("✅ pgvector extension enabled");
  await sql.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
