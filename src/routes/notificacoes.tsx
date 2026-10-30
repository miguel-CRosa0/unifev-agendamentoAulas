import { createFileRoute } from "@tanstack/react-router";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";

export const Route = createFileRoute("/notificacoes")({
  component: NotificacoesPage,
  head: () => ({
    meta: [
      { title: "Notificações — Agendamento de Aulas" },
      { name: "description", content: "Avisos de conflitos de horário, confirmações e cancelamentos de agendamentos." },
      { property: "og:title", content: "Notificações — Agendamento de Aulas" },
      { property: "og:description", content: "Alertas do sistema de agendamento de salas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function NotificacoesPage() {
  const { notificacoes } = useStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            {notificacoes.length} alertas e mensagens registradas pelo sistema
          </p>
        </div>
        <NotificationsPanel notificacoes={notificacoes} />
      </div>
    </DashboardLayout>
  );
}
