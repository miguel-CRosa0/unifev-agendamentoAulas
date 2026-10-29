import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth.server";
import { garantirAdministradorUmaVez } from "@/lib/usuarios.server";

async function handler({ request }: { request: Request }) {
  // Cria a conta do administrador no primeiro acesso, mesmo sem rodar o seed
  await garantirAdministradorUmaVez();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
