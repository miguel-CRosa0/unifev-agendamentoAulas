// Funções de servidor (TanStack Start). O corpo de cada handler roda só no servidor;
// no navegador elas viram chamadas HTTP.
import { createMiddleware, createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import type {
  Agendamento,
  Notificacao,
  Perfil,
  Sala,
  StatusAgendamento,
  StatusSala,
  Usuario,
} from "@/components/dashboard/data";
import type { Configuracoes, DisciplinaItem } from "@/components/dashboard/data";
import { auth } from "./auth.server";
import { prisma } from "./db.server";
import { ADMIN_EMAIL, criarContaUsuario, definirSenha } from "./usuarios.server";

// ---------- Sessão e permissões ----------

// Perfis que o administrador pode atribuir (o único Administrador é admin@unifev.com.br)
const PERFIS_CADASTRO = ["Coordenador", "Professor"] as const;
const STATUS_SALA = ["disponível", "ocupada", "manutenção"] as const;
const STATUS_AGENDAMENTO = ["confirmado", "pendente", "cancelado"] as const;
const TURNOS = ["Matutino", "Vespertino", "Noturno", "Integral"] as const;

export interface SessaoUsuario extends Usuario {
  mustChangePassword: boolean;
}

const sessaoAtual = createServerOnlyFn(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
});

/** Exige sessão, mas aceita usuário com senha temporária (usado só na troca de senha). */
const sessaoMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const user = await sessaoAtual();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  return next({ context: { user } });
});

/** Exige sessão de usuário que já trocou a senha temporária. */
const authMiddleware = createMiddleware({ type: "function" })
  .middleware([sessaoMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.mustChangePassword) {
      throw new Error("Defina sua senha pessoal antes de continuar.");
    }
    return next();
  });

type DbUser = NonNullable<Awaited<ReturnType<typeof sessaoAtual>>>;

function exigirPerfil(user: DbUser, perfis: Perfil[], acao: string) {
  if (!perfis.includes(user.perfil as Perfil)) {
    throw new Error(`Seu perfil (${user.perfil}) não tem permissão para ${acao}.`);
  }
}

const ADMIN: Perfil[] = ["Administrador"];
const GESTAO: Perfil[] = ["Administrador", "Coordenador"];

// ---------- Conversão banco → tipos do front ----------

/** Remove chaves com `undefined` (vindas de schemas `.partial()`), como o Prisma exige. */
function definidos<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}

function formatarDataHora(d: Date) {
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

function hojeISO() {
  // AAAA-MM-DD no fuso de Brasília
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function dataBR(iso: string) {
  return iso.split("-").reverse().join("/");
}

function minutos(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Instante do início do agendamento (Brasília não tem horário de verão desde 2019: UTC-3 fixo). */
function inicioAgendamento(data: string, hora: string) {
  return new Date(`${data}T${hora}:00-03:00`);
}

function horaAtualBrasilia() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toUsuario(u: DbUser): Usuario {
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    perfil: u.perfil as Perfil,
    tambemProfessor: u.tambemProfessor,
    nivelAcesso: Array.isArray(u.nivelAcesso) ? (u.nivelAcesso as string[]) : [],
    ra: u.username ?? "",
    telefone: u.telefone ?? "",
  };
}

const salaInclude = { recursos: true } as const;
const agendamentoInclude = { sala: true, solicitante: true } as const;

type DbSala = Awaited<ReturnType<typeof prisma.sala.findMany<{ include: typeof salaInclude }>>>[number];
type DbAgendamento = Awaited<
  ReturnType<typeof prisma.agendamento.findMany<{ include: typeof agendamentoInclude }>>
>[number];
type DbDisciplina = Awaited<ReturnType<typeof prisma.disciplina.findMany<{ include: { sala: true } }>>>[number];

function toSala(s: DbSala): Sala {
  return {
    id: s.id,
    codigo: s.codigo,
    nome: s.nome,
    localizacao: s.localizacao,
    capacidade: s.capacidade,
    status: s.status as StatusSala,
    recursos: s.recursos.map((r) => ({ id: r.id, nome: r.nome, descricao: r.descricao })),
  };
}

function toAgendamento(a: DbAgendamento): Agendamento {
  return {
    id: a.id,
    data: a.data,
    horaInicio: a.horaInicio,
    horaFim: a.horaFim,
    status: a.status as StatusAgendamento,
    salaCodigo: a.sala.codigo,
    salaNome: a.sala.nome,
    salaLocalizacao: a.sala.localizacao,
    disciplina: a.disciplina,
    disciplinaCodigo: a.disciplinaCodigo,
    turma: a.turma,
    professorResponsavel: a.professorResponsavel,
    solicitanteId: a.solicitanteId,
    solicitanteNome: a.solicitante?.name ?? "Usuário removido",
    solicitantePerfil: (a.solicitante?.perfil as Perfil | undefined) ?? "Professor",
    alunos: a.alunos,
  };
}

function toDisciplina(d: DbDisciplina): DisciplinaItem {
  return {
    id: d.id,
    codigo: d.codigo,
    nome: d.nome,
    turma: d.turma,
    turno: d.turno as DisciplinaItem["turno"],
    semestre: d.semestre,
    professor: d.professor,
    alunos: d.alunos,
    ...(d.sala ? { salaPadrao: d.sala.codigo } : {}),
  };
}

function toNotificacao(n: { id: string; mensagem: string; tipo: string; createdAt: Date }): Notificacao {
  return {
    id: n.id,
    mensagem: n.mensagem,
    tipo: n.tipo as Notificacao["tipo"],
    dataHora: formatarDataHora(n.createdAt),
  };
}

async function obterConfiguracoes(): Promise<Configuracoes> {
  const { id: _id, ...config } = await prisma.configuracao.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  return config;
}

async function notificar(mensagem: string, tipo: Notificacao["tipo"]) {
  await prisma.notificacao.create({ data: { mensagem, tipo } });
}

async function salaIdPorCodigo(codigo: string | undefined) {
  if (!codigo) return null;
  const sala = await prisma.sala.findUnique({ where: { codigo } });
  if (!sala) throw new Error(`Sala ${codigo} não encontrada.`);
  return sala.id;
}

// ---------- Leitura ----------

export const getSessao = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessaoUsuario | null> => {
    const user = await sessaoAtual();
    if (!user) return null;
    return { ...toUsuario(user), mustChangePassword: user.mustChangePassword };
  },
);

export interface DadosSistema {
  salas: Sala[];
  agendamentos: Agendamento[];
  disciplinas: DisciplinaItem[];
  usuarios: Usuario[];
  notificacoes: Notificacao[];
  configuracoes: Configuracoes;
}

export const getDados = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<DadosSistema> => {
    const hoje = hojeISO();
    const agora = horaAtualBrasilia();
    const [salas, agendamentos, disciplinas, usuarios, notificacoes, configuracoes, emAndamento] = await Promise.all([
      prisma.sala.findMany({ include: salaInclude, orderBy: { codigo: "asc" } }),
      prisma.agendamento.findMany({
        include: agendamentoInclude,
        orderBy: [{ data: "desc" }, { horaInicio: "asc" }],
      }),
      prisma.disciplina.findMany({ include: { sala: true }, orderBy: { nome: "asc" } }),
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.notificacao.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      obterConfiguracoes(),
      prisma.agendamento.findMany({
        where: { data: hoje, status: "confirmado", horaInicio: { lte: agora }, horaFim: { gt: agora } },
        select: { salaId: true },
      }),
    ]);
    // "Ocupada" é calculado pelos agendamentos em andamento; status manual
    // (ocupada/manutenção) definido pela gestão continua valendo.
    const salasEmUso = new Set(emAndamento.map((a) => a.salaId));
    return {
      salas: salas.map((s) => {
        const sala = toSala(s);
        return sala.status === "disponível" && salasEmUso.has(s.id) ? { ...sala, status: "ocupada" as const } : sala;
      }),
      agendamentos: agendamentos.map(toAgendamento),
      disciplinas: disciplinas.map(toDisciplina),
      usuarios: usuarios.map(toUsuario),
      notificacoes: notificacoes.map(toNotificacao),
      configuracoes,
    };
  });

// ---------- Salas ----------

const recursoSchema = z.object({ nome: z.string().min(1), descricao: z.string().default("") });

const salaSchema = z.object({
  codigo: z.string().trim().min(1).max(20),
  nome: z.string().trim().min(1),
  localizacao: z.string().trim().min(1),
  capacidade: z.number().int().min(1),
  status: z.enum(STATUS_SALA),
  recursos: z.array(recursoSchema),
});

export const criarSala = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(salaSchema)
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "cadastrar salas");
    const { recursos, ...sala } = data;
    if (await prisma.sala.findUnique({ where: { codigo: sala.codigo } })) {
      throw new Error(`Já existe uma sala com o código ${sala.codigo}.`);
    }
    const criada = await prisma.sala.create({ data: { ...sala, recursos: { create: recursos } } });
    await notificar(`Nova sala cadastrada: ${criada.codigo} — ${criada.nome}`, "sistema");
  });

export const atualizarSala = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), dados: salaSchema.partial() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "editar salas");
    const { recursos, ...sala } = data.dados;
    await prisma.$transaction(async (tx) => {
      await tx.sala.update({ where: { id: data.id }, data: definidos(sala) });
      if (recursos) {
        await tx.recurso.deleteMany({ where: { salaId: data.id } });
        await tx.recurso.createMany({ data: recursos.map((r) => ({ ...r, salaId: data.id })) });
      }
    });
  });

export const alterarStatusSala = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), status: z.enum(STATUS_SALA) }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "alterar o status de salas");
    await prisma.sala.update({ where: { id: data.id }, data: { status: data.status } });
  });

export const excluirSala = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "excluir salas");
    await prisma.sala.delete({ where: { id: data.id } });
  });

// ---------- Agendamentos ----------

const agendamentoSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/),
  salaCodigo: z.string().min(1),
  disciplina: z.string().trim().min(1),
  disciplinaCodigo: z.string().trim().min(1).max(20),
  turma: z.string().trim().min(1),
  professorResponsavel: z.string().trim().min(1),
  alunos: z.number().int().min(1),
});

export const criarAgendamento = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(agendamentoSchema)
  .handler(async ({ data, context }): Promise<{ success: boolean; message: string }> => {
    if (data.horaFim <= data.horaInicio) {
      return { success: false, message: "O horário final deve ser depois do inicial." };
    }
    const sala = await prisma.sala.findUnique({ where: { codigo: data.salaCodigo } });
    if (!sala) return { success: false, message: `Sala ${data.salaCodigo} não encontrada.` };
    if (data.alunos > sala.capacidade) {
      return {
        success: false,
        message: `A sala ${sala.codigo} comporta ${sala.capacidade} alunos (informado: ${data.alunos}).`,
      };
    }

    const config = await obterConfiguracoes();
    const duracao = minutos(data.horaFim) - minutos(data.horaInicio);
    if (duracao > config.duracaoMaxima) {
      return {
        success: false,
        message: `A duração máxima por reserva é de ${config.duracaoMaxima} minutos (solicitado: ${duracao}).`,
      };
    }
    const horasAteInicio = (inicioAgendamento(data.data, data.horaInicio).getTime() - Date.now()) / 3_600_000;
    if (horasAteInicio < 0) {
      return { success: false, message: "Não é possível agendar em um horário que já passou." };
    }
    if (horasAteInicio < config.antecedenciaMinima) {
      return {
        success: false,
        message: `Os agendamentos precisam ser feitos com ao menos ${config.antecedenciaMinima}h de antecedência.`,
      };
    }
    const conflito = await prisma.agendamento.findFirst({
      where: {
        salaId: sala.id,
        data: data.data,
        status: { not: "cancelado" },
        horaInicio: { lt: data.horaFim },
        horaFim: { gt: data.horaInicio },
      },
    });

    if (conflito && config.bloquearConflitos) {
      await notificar(
        `Conflito de horário bloqueado na sala ${sala.codigo} para o dia ${dataBR(data.data)} às ${data.horaInicio}.`,
        "conflito",
      );
      return {
        success: false,
        message: `Conflito de horário: a sala ${sala.codigo} já está reservada das ${conflito.horaInicio} às ${conflito.horaFim} (${conflito.disciplina}).`,
      };
    }

    const status: StatusAgendamento =
      context.user.perfil === "Professor" && config.aprovacaoCoordenador ? "pendente" : "confirmado";

    const { salaCodigo: _codigo, ...campos } = data;
    await prisma.agendamento.create({
      data: { ...campos, status, salaId: sala.id, solicitanteId: context.user.id },
    });

    await notificar(
      status === "pendente"
        ? `Novo agendamento pendente de aprovação: ${data.disciplina} na sala ${sala.codigo}.`
        : `Agendamento confirmado: ${data.disciplina} na sala ${sala.codigo} dia ${dataBR(data.data)}.`,
      status === "pendente" ? "sistema" : "confirmacao",
    );

    return {
      success: true,
      message:
        status === "pendente"
          ? "Agendamento solicitado com sucesso! Aguardando aprovação da coordenação."
          : "Agendamento confirmado com sucesso!",
    };
  });

export const alterarStatusAgendamento = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), status: z.enum(STATUS_AGENDAMENTO) }))
  .handler(async ({ data, context }) => {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: data.id } });
    if (!agendamento) throw new Error("Agendamento não encontrado.");
    // Quem solicitou pode cancelar o próprio agendamento; aprovar é da gestão.
    const cancelandoProprio = data.status === "cancelado" && agendamento.solicitanteId === context.user.id;
    if (!cancelandoProprio) exigirPerfil(context.user, GESTAO, "alterar o status de agendamentos");

    await prisma.agendamento.update({ where: { id: data.id }, data: { status: data.status } });
    await notificar(
      `Status do agendamento de ${agendamento.disciplina} alterado para ${data.status.toUpperCase()}.`,
      data.status === "cancelado" ? "cancelamento" : "confirmacao",
    );
  });

export const excluirAgendamento = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "excluir agendamentos");
    await prisma.agendamento.delete({ where: { id: data.id } });
  });

// ---------- Disciplinas ----------

const disciplinaSchema = z.object({
  codigo: z.string().trim().min(1).max(20),
  nome: z.string().trim().min(1),
  turma: z.string().trim().min(1),
  turno: z.enum(TURNOS),
  semestre: z.string().trim().min(1),
  professor: z.string().trim().min(1),
  alunos: z.number().int().min(0),
  salaPadrao: z.string().optional(),
});

export const criarDisciplina = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(disciplinaSchema)
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "cadastrar disciplinas");
    const { salaPadrao, ...disciplina } = data;
    if (await prisma.disciplina.findUnique({ where: { codigo: disciplina.codigo } })) {
      throw new Error(`Já existe uma disciplina com o código ${disciplina.codigo}.`);
    }
    await prisma.disciplina.create({ data: { ...disciplina, salaId: await salaIdPorCodigo(salaPadrao) } });
  });

export const atualizarDisciplina = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), dados: disciplinaSchema.partial() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "editar disciplinas");
    const { salaPadrao, ...disciplina } = data.dados;
    await prisma.disciplina.update({
      where: { id: data.id },
      data: {
        ...definidos(disciplina),
        ...("salaPadrao" in data.dados ? { salaId: await salaIdPorCodigo(salaPadrao) } : {}),
      },
    });
  });

export const excluirDisciplina = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "excluir disciplinas");
    await prisma.disciplina.delete({ where: { id: data.id } });
  });

// ---------- Usuários ----------

/** Senha temporária = data de nascimento no formato DDMMAAAA. */
function senhaPorNascimento(nascimento: string) {
  return nascimento.split("-").reverse().join("");
}

function senhaAleatoria() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

export const criarUsuario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      nome: z.string().trim().min(1),
      email: z.string().trim().email(),
      ra: z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/, "RA inválido"),
      telefone: z.string().optional(),
      nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      perfil: z.enum(PERFIS_CADASTRO),
      nivelAcesso: z.array(z.string()),
    }),
  )
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "cadastrar usuários");
    if (data.email.toLowerCase() === ADMIN_EMAIL) throw new Error("Este e-mail é reservado ao administrador.");
    const existente = await prisma.user.findFirst({
      where: { OR: [{ email: data.email.toLowerCase() }, { username: data.ra.toLowerCase() }] },
    });
    if (existente) throw new Error("Já existe um usuário com este e-mail ou RA.");

    const config = await obterConfiguracoes();
    const senhaTemporaria = config.senhaTemporariaNascimento
      ? senhaPorNascimento(data.nascimento)
      : senhaAleatoria();

    await criarContaUsuario({
      ...data,
      senha: senhaTemporaria,
      mustChangePassword: config.trocaObrigatoriaPrimeiroLogin,
    });
    await notificar(`Novo usuário registrado: ${data.nome} (${data.perfil}).`, "sistema");
    return { senhaTemporaria };
  });

export const atualizarUsuario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      nome: z.string().trim().min(1),
      email: z.string().trim().email(),
      perfil: z.enum(["Administrador", ...PERFIS_CADASTRO]),
      nivelAcesso: z.array(z.string()),
    }),
  )
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "editar usuários");
    const alvo = await prisma.user.findUnique({ where: { id: data.id } });
    if (!alvo) throw new Error("Usuário não encontrado.");
    const email = data.email.toLowerCase();

    if (alvo.email === ADMIN_EMAIL) {
      // Conta do administrador: só o nome pode mudar
      if (email !== ADMIN_EMAIL || data.perfil !== "Administrador") {
        throw new Error("O e-mail e o perfil do administrador não podem ser alterados.");
      }
      await prisma.user.update({ where: { id: data.id }, data: { name: data.nome } });
      return;
    }

    if (data.perfil === "Administrador") throw new Error("O sistema tem um único administrador.");
    if (email === ADMIN_EMAIL) throw new Error("Este e-mail é reservado ao administrador.");
    const emailEmUso = await prisma.user.findFirst({ where: { email, id: { not: data.id } } });
    if (emailEmUso) throw new Error("Já existe um usuário com este e-mail.");

    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.nome,
        email,
        perfil: data.perfil,
        tambemProfessor: data.perfil === "Coordenador",
        nivelAcesso: data.nivelAcesso,
      },
    });
  });

export const excluirUsuario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "excluir usuários");
    if (data.id === context.user.id) throw new Error("Você não pode excluir o próprio usuário.");
    await prisma.user.delete({ where: { id: data.id } });
  });

export const redefinirSenhaUsuario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "redefinir senhas");
    const senhaTemporaria = senhaAleatoria();
    await definirSenha(data.id, senhaTemporaria);
    await prisma.user.update({ where: { id: data.id }, data: { mustChangePassword: true } });
    // Encerra as sessões abertas do usuário
    await prisma.session.deleteMany({ where: { userId: data.id } });
    return { senhaTemporaria };
  });

export const trocarMinhaSenha = createServerFn({ method: "POST" })
  .middleware([sessaoMiddleware])
  .validator(z.object({ novaSenha: z.string() }))
  .handler(async ({ data, context }) => {
    const config = await obterConfiguracoes();
    const { novaSenha } = data;
    if (novaSenha.length < config.tamanhoMinimoSenha || !/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha)) {
      throw new Error(
        `A senha deve ter ao menos ${config.tamanhoMinimoSenha} caracteres, com letras e números.`,
      );
    }
    if (/^\d{8}$/.test(novaSenha)) throw new Error("A senha não pode ser uma data de nascimento.");
    await definirSenha(context.user.id, novaSenha);
    await prisma.user.update({ where: { id: context.user.id }, data: { mustChangePassword: false } });
  });

// ---------- Notificações ----------

export const excluirNotificacao = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, GESTAO, "remover notificações");
    await prisma.notificacao.delete({ where: { id: data.id } });
  });

export const limparNotificacoes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    exigirPerfil(context.user, GESTAO, "remover notificações");
    await prisma.notificacao.deleteMany();
  });

// ---------- Configurações ----------

export const atualizarConfiguracoes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z
      .object({
        antecedenciaMinima: z.number().int().min(0),
        duracaoMaxima: z.number().int().min(1),
        bloquearConflitos: z.boolean(),
        aprovacaoCoordenador: z.boolean(),
        senhaTemporariaNascimento: z.boolean(),
        trocaObrigatoriaPrimeiroLogin: z.boolean(),
        tamanhoMinimoSenha: z.number().int().min(6).max(64),
      })
      .partial(),
  )
  .handler(async ({ data, context }) => {
    exigirPerfil(context.user, ADMIN, "alterar configurações");
    const valores = definidos(data);
    await prisma.configuracao.upsert({ where: { id: 1 }, create: { id: 1, ...valores }, update: valores });
  });
