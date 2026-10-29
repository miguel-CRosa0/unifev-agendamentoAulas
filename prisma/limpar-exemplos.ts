// Remove do banco os dados de exemplo inseridos pelo seed antigo (salas, disciplinas,
// usuários, agendamentos e notificações fictícios). Rode com: npm run db:limpar-exemplos
import "dotenv/config";

import { prisma } from "../src/lib/db.server";

const SALAS = ["LAB-101", "LAB-102", "SAL-201", "LAB-203", "AUD-001", "SAL-305"];
const DISCIPLINAS = ["POO-204", "RED-118", "SEM-010", "BDD-142", "QUI-060", "ESW-231", "CAL-101", "IA-402"];
const EMAILS = [
  "marcos.andrade@instituicao.edu.br",
  "carla.mendes@instituicao.edu.br",
  "ana.souza@instituicao.edu.br",
  "gabriel.teixeira@instituicao.edu.br",
];
const NOTIFICACOES = [
  "Conflito de horário detectado no LAB-101 para 04/09 às 07:30.",
  "Agendamento do Auditório Central aguarda confirmação da coordenação.",
  "Química Aplicada cancelada — LAB-203 em manutenção.",
  "Relatório de uso das salas (01/08 a 31/08) disponível para download.",
];

async function main() {
  // Agendamentos e recursos das salas são removidos em cascata
  const salas = await prisma.sala.deleteMany({ where: { codigo: { in: SALAS } } });
  const disciplinas = await prisma.disciplina.deleteMany({ where: { codigo: { in: DISCIPLINAS } } });
  const usuarios = await prisma.user.deleteMany({ where: { email: { in: EMAILS } } });
  const notificacoes = await prisma.notificacao.deleteMany({ where: { mensagem: { in: NOTIFICACOES } } });
  console.log(
    `Removidos: ${salas.count} salas, ${disciplinas.count} disciplinas, ${usuarios.count} usuários, ${notificacoes.count} notificações.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
