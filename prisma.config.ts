import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations precisam de conexão direta (sem o pooler do Supabase).
// Na Vercel, a integração do Supabase cria POSTGRES_URL_NON_POOLING.
const url =
  process.env["DIRECT_URL"] ?? process.env["POSTGRES_URL_NON_POOLING"] ?? process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(url ? { datasource: { url } } : {}),
});
