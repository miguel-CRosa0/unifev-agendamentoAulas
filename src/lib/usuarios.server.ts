import type { Perfil } from "@/components/dashboard/data";
import { auth } from "./auth.server";
import { prisma } from "./db.server";

export async function definirSenha(userId: string, senha: string) {
  const ctx = await auth.$context;
  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(senha));
}

/** Cria usuário + conta com senha, sem abrir sessão (usado pelo cadastro e pelo seed). */
export async function criarContaUsuario(dados: {
  nome: string;
  email: string;
  ra: string;
  telefone?: string | undefined;
  perfil: Perfil;
  nivelAcesso: string[];
  senha: string;
  mustChangePassword?: boolean;
}) {
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.createUser({
    name: dados.nome,
    email: dados.email.toLowerCase(),
    username: dados.ra.toLowerCase(),
    displayUsername: dados.ra,
  }, { method: "admin" });
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
