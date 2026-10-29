import type { Perfil } from "@/components/dashboard/data";
import { auth } from "./auth.server";
import { prisma } from "./db.server";

/** Único administrador do sistema. Os demais usuários são cadastrados por ele. */
export const ADMIN_EMAIL = "unifev@admin.com";
const ADMIN_SENHA_INICIAL = "admin102030";

export const PERMISSOES_ADMIN = [
  "Gerenciar salas",
  "Gerenciar usuários",
  "Definir nível de acesso",
  "Gerar relatório",
];

export async function definirSenha(userId: string, senha: string) {
  const ctx = await auth.$context;
  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(senha));
}

/** Cria usuário + conta com senha, sem abrir sessão (usado pelo cadastro e pelo seed). */
export async function criarContaUsuario(dados: {
  nome: string;
  email: string;
  ra?: string | undefined;
  telefone?: string | undefined;
  perfil: Perfil;
  nivelAcesso: string[];
  senha: string;
  mustChangePassword?: boolean;
}) {
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.createUser(
    {
      name: dados.nome,
      email: dados.email.toLowerCase(),
      ...(dados.ra ? { username: dados.ra.toLowerCase(), displayUsername: dados.ra } : {}),
    },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(dados.senha),
  });
  await prisma.user.update({
    where: { id: user.id },
    data: {
      perfil: dados.perfil,
      tambemProfessor: dados.perfil === "Coordenador",
      telefone: dados.telefone ?? null,
      nivelAcesso: dados.nivelAcesso,
      mustChangePassword: dados.mustChangePassword ?? true,
    },
  });
  return user;
}

/**
 * Garante que a conta do administrador exista (senha inicial admin102030) e seja a
 * única com perfil Administrador. Se a senha for trocada depois, ela é mantida.
 */
export async function garantirAdministrador() {
  let admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    const criado = await criarContaUsuario({
      nome: "Administrador Unifev",
      email: ADMIN_EMAIL,
      perfil: "Administrador",
      nivelAcesso: PERMISSOES_ADMIN,
      senha: ADMIN_SENHA_INICIAL,
      mustChangePassword: false,
    });
    admin = await prisma.user.findUniqueOrThrow({ where: { id: criado.id } });
  } else if (admin.perfil !== "Administrador") {
    await prisma.user.update({
      where: { id: admin.id },
      data: { perfil: "Administrador", tambemProfessor: false, nivelAcesso: PERMISSOES_ADMIN },
    });
  }
  // Qualquer outro usuário com perfil de administrador vira coordenador
  await prisma.user.updateMany({
    where: { perfil: "Administrador", id: { not: admin.id } },
    data: { perfil: "Coordenador", tambemProfessor: true },
  });
  return admin;
}

let adminPronto: Promise<unknown> | null = null;

/** Executa garantirAdministrador uma vez por processo (tenta de novo se falhar). */
export function garantirAdministradorUmaVez() {
  adminPronto ??= garantirAdministrador().catch((e) => {
    adminPronto = null;
    throw e;
  });
  return adminPronto;
}
