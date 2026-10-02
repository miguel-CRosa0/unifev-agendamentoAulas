import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UsersPanel } from "@/components/dashboard/users-panel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/usuarios")({
  component: UsuariosPage,
  head: () => ({
    meta: [
      { title: "Usuários e acessos — SalaFácil" },
      { name: "description", content: "Gerencie perfis de administrador, coordenador e professor e seus níveis de acesso." },
      { property: "og:title", content: "Usuários e acessos — SalaFácil" },
      { property: "og:description", content: "Perfis e permissões dos usuários do sistema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function UsuariosPage() {
  const { usuarios } = useStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Usuários e acessos</h1>
            <p className="text-sm text-muted-foreground">
              {usuarios.length} usuários registrados no sistema com controle de acesso baseado em papéis (RBAC).
            </p>
          </div>
          <Button asChild className="gap-1.5 shadow-sm">
            <Link to="/cadastro">
              <UserPlus className="h-4 w-4" /> Cadastrar novo usuário
            </Link>
          </Button>
        </div>
        <UsersPanel usuarios={usuarios} />
      </div>
    </DashboardLayout>
  );
}
