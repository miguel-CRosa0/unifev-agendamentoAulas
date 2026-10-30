import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  DoorOpen,
  FileBarChart,
  Layers,
  Plus,
} from "lucide-react";

import { useStore } from "@/context/store-context";
import { CalendarPanel } from "@/components/dashboard/calendar-panel";
import { DashboardLayout } from "@/components/dashboard/layout";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — SalaFácil Gestão de Salas" },
      {
        name: "description",
        content:
          "Painel de gestão e controle de agendamento de salas de aula e laboratórios: calendário de agendamentos e indicadores.",
      },
      { property: "og:title", content: "Dashboard — SalaFácil Gestão de Salas" },
      {
        property: "og:description",
        content: "Gestão de salas, laboratórios, turmas, disciplinas e agendamentos acadêmicos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function DashboardPage() {
  const { agendamentos, indicadores, currentUser, openNovoAgendamento, salas } = useStore();

  const salasDisponiveis = salas.filter((s) => s.status === "disponível").length;
  const pendentesCount = agendamentos.filter((a) => a.status === "pendente").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Gestão e controle de agendamento de salas de aula, laboratórios e turmas acadêmicas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => openNovoAgendamento()}
              className="font-medium shadow-sm"
              size="sm"
            >
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              Agendar Sala
            </Button>
            <div className="hidden md:block text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              Sessão: <span className="font-semibold text-foreground">{currentUser.nome}</span> ({currentUser.perfil})
            </div>
          </div>
        </div>

        {/* Dynamic Indicators */}
        <StatsCards indicadores={indicadores} />

        {/* Quick Action Shortcuts Banner */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => openNovoAgendamento()}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Nova Reserva</p>
              <p className="text-xs text-muted-foreground">Reservar sala para aula ou evento</p>
            </div>
          </button>

          <Link
            to="/salas"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{salasDisponiveis} Salas Livres</p>
              <p className="text-xs text-muted-foreground">Consultar mapa de laboratórios</p>
            </div>
          </Link>

          <Link
            to="/agendamentos"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {pendentesCount > 0 ? `${pendentesCount} Pendentes` : "Sem Pendências"}
              </p>
              <p className="text-xs text-muted-foreground">Revisar e aprovar agendamentos</p>
            </div>
          </Link>

          <Link
            to="/relatorios"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Relatório e Ocupação</p>
              <p className="text-xs text-muted-foreground">Exportar dados de frequência</p>
            </div>
          </Link>
        </div>

        {/* Interactive Calendar View */}
        <CalendarPanel agendamentos={agendamentos} />

        {/* Bookings Table with Interactive Actions */}
        <RecentBookings agendamentos={agendamentos} />
      </div>
    </DashboardLayout>
  );
}
