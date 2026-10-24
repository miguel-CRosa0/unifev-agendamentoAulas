// Popula o banco com os dados de exemplo. Rode com: npm run db:seed
// Só insere o que ainda não existe, então pode ser executado mais de uma vez.
import "dotenv/config";

import {
  agendamentos,
  initialDisciplinas,
  notificacoes,
  salas,
  usuarios,
} from "../src/components/dashboard/data";
import { prisma } from "../src/lib/db.server";
import { criarContaUsuario } from "../src/lib/usuarios.server";

// RA e data de nascimento (senha temporária DDMMAAAA) dos usuários de exemplo
const credenciais: Record<string, { ra: string; nascimento: string }> = {
  u1: { ra: "20260001", nascimento: "15031980" },
  u2: { ra: "20260002", nascimento: "22071985" },
  u3: { ra: "20260003", nascimento: "10082004" },
  u4: { ra: "20260004", nascimento: "05111990" },
};

async function main() {
  await prisma.configuracao.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });

  for (const s of salas) {
    await prisma.sala.upsert({
      where: { codigo: s.codigo },
      update: {},
      create: {
        codigo: s.codigo,
        nome: s.nome,
        localizacao: s.localizacao,
        capacidade: s.capacidade,
        status: s.status,
        recursos: { create: s.recursos.map((r) => ({ nome: r.nome, descricao: r.descricao })) },
      },
    });
  }

  for (const d of initialDisciplinas) {
    const sala = d.salaPadrao ? await prisma.sala.findUnique({ where: { codigo: d.salaPadrao } }) : null;
    const { id: _id, salaPadrao: _sala, ...dados } = d;
    await prisma.disciplina.upsert({
      where: { codigo: d.codigo },
      update: {},
      create: { ...dados, salaId: sala?.id ?? null },
    });
  }

  const idsUsuarios = new Map<string, string>();
  for (const u of usuarios) {
    const cred = credenciais[u.id]!;
    const existente = await prisma.user.findUnique({ where: { email: u.email } });
    const user =
      existente ??
      (await criarContaUsuario({
        nome: u.nome,
        email: u.email,
        ra: cred.ra,
        perfil: u.perfil,
        nivelAcesso: u.nivelAcesso,
        senha: cred.nascimento,
      }));
    idsUsuarios.set(u.nome, user.id);
    if (!existente) console.log(`Usuário ${u.nome} (${u.perfil}) — RA ${cred.ra}, senha ${cred.nascimento}`);
  }

  if ((await prisma.agendamento.count()) === 0) {
    for (const a of agendamentos) {
      const sala = await prisma.sala.findUniqueOrThrow({ where: { codigo: a.salaCodigo } });
      await prisma.agendamento.create({
        data: {
          data: a.data,
          horaInicio: a.horaInicio,
          horaFim: a.horaFim,
          status: a.status,
          salaId: sala.id,
          disciplina: a.disciplina,
          disciplinaCodigo: a.disciplinaCodigo,
          turma: a.turma,
          professorResponsavel: a.professorResponsavel,
          alunos: a.alunos,
          solicitanteId: idsUsuarios.get(a.solicitanteNome) ?? null,
        },
      });
    }
  }

  if ((await prisma.notificacao.count()) === 0) {
    await prisma.notificacao.createMany({
      data: notificacoes.map((n) => ({ mensagem: n.mensagem, tipo: n.tipo })),
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
