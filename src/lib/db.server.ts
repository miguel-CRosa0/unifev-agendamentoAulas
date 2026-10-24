import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Em produção usa a conexão via pooler do Supabase (POSTGRES_PRISMA_URL / POSTGRES_URL,
// criadas pela integração da Vercel). Localmente, DATABASE_URL no .env.
// Para MySQL: troque PrismaPg por PrismaMariaDb (@prisma/adapter-mariadb).
function connectionString() {
  const url =
    process.env["DATABASE_URL"] ?? process.env["POSTGRES_PRISMA_URL"] ?? process.env["POSTGRES_URL"];
  if (!url) throw new Error("DATABASE_URL não configurada.");
  return url;
}

function createClient() {
  const url = new URL(connectionString());
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  // O `pg` trata sslmode=require como verificação completa do certificado, o que falha
  // com a cadeia do Supabase. Removemos o parâmetro e ligamos SSL sem verificação da CA.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("supa");
  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
