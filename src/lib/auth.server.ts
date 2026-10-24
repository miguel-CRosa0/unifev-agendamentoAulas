import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { prisma } from "./db.server";

const vercelOrigins = [
  process.env["VERCEL_URL"],
  process.env["VERCEL_BRANCH_URL"],
  process.env["VERCEL_PROJECT_PRODUCTION_URL"],
]
  .filter((host): host is string => Boolean(host))
  .map((host) => `https://${host}`);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: vercelOrigins,
  emailAndPassword: {
    enabled: true,
    // Contas são criadas apenas pelo administrador (tela de cadastro).
    disableSignUp: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      perfil: { type: "string", input: false, defaultValue: "Professor" },
      tambemProfessor: { type: "boolean", input: false, defaultValue: false },
      telefone: { type: "string", input: false, required: false },
      mustChangePassword: { type: "boolean", input: false, defaultValue: true },
    },
  },
  plugins: [
    // Login pelo RA
    username({ minUsernameLength: 3, maxUsernameLength: 20 }),
    tanstackStartCookies(),
  ],
});
