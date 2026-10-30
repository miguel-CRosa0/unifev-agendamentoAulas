import { createFileRoute, Link } from "@tanstack/react-router";

import { useStore } from "@/context/store-context";
import { CalendarPanel } from "@/components/dashboard/calendar-panel";
import { DashboardLayout } from "@/components/dashboard/layout";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { StatsCards } from "@/components/dashboard/stats-cards";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Agendamento de Aulas" },
      {
        name: "description",
        content:
          "Painel de gestão e controle de agendamento de salas de aula e laboratórios: calendário de agendamentos e indicadores.",
      },
      { property: "og:title", content: "Dashboard — Agendamento de Aulas" },
      {
        property: "og:description",
        content: "Gestão de salas, laboratórios, turmas, disciplinas e agendamentos acadêmicos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function dataExtensa() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
}

function DashboardPage() {
  const { agendamentos, indicadores, currentUser, openNovoAgendamento } = useStore();

  const pendentesCount = agendamentos.filter((a) => a.status === "pendente").length;
  const primeiroNome = currentUser.nome.split(" ")[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm capitalize text-muted-foreground">{dataExtensa()}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Olá, {primeiroNome}</h1>
          </div>
        </div>

        {pendentesCount > 0 && (
          <Link
            to="/agendamentos"
            className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-accent px-5 py-3 text-sm text-accent-foreground transition-colors hover:bg-accent/70"
          >
            <span>
              <strong className="font-semibold">
                {pendentesCount} {pendentesCount === 1 ? "solicitação aguarda" : "solicitações aguardam"} aprovação
              </strong>
            </span>
            <span className="shrink-0 underline underline-offset-2">Revisar</span>
          </Link>
        )}

        <StatsCards indicadores={indicadores} />

        <CalendarPanel agendamentos={agendamentos} />

        <RecentBookings agendamentos={agendamentos} />
      </div>
    </DashboardLayout>
  );
}
