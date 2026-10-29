// Prepara o banco para uso: configurações padrão e a conta do administrador
// (unifev@admin.com / admin102030). Rode com: npm run db:seed
// Pode ser executado mais de uma vez. Salas, disciplinas e usuários são cadastrados pelo sistema.
import "dotenv/config";

import { prisma } from "../src/lib/db.server";
import { ADMIN_EMAIL, garantirAdministrador } from "../src/lib/usuarios.server";

async function main() {
  await prisma.configuracao.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
  await garantirAdministrador();
  console.log(`Administrador pronto: ${ADMIN_EMAIL}`);
  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
