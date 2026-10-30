import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { GradeSalas } from "@/components/dashboard/grade-salas";
import { CalendarPanel } from "@/components/dashboard/calendar-panel";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/agendamentos")({
  component: AgendamentosPage,
  head: () => ({
    meta: [
      { title: "Agendamentos — Agendamento de Aulas" },
      { name: "description", content: "Consulte, confirme e edite agendamentos de salas e laboratórios por data, turma e professor." },
      { property: "og:title", content: "Agendamentos — Agendamento de Aulas" },
      { property: "og:description", content: "Lista e calendário de agendamentos acadêmicos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AgendamentosPage() {
  const { agendamentos, openNovoAgendamento } = useStore();

  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const pendentes = agendamentos.filter((a) => a.status === "pendente").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Agendamentos</h1>
            <p className="text-sm text-muted-foreground">
              {agendamentos.length} reservas registradas · <span className="text-blue-600 dark:text-blue-400 font-medium">{confirmados} confirmadas</span> · {pendentes} pendentes · {cancelados} canceladas
            </p>
          </div>
          <Button onClick={() => openNovoAgendamento()} className="gap-1.5">
            <CalendarPlus className="h-4 w-4" /> Novo agendamento
          </Button>
        </div>

        <GradeSalas agendamentos={agendamentos} />
        <CalendarPanel agendamentos={agendamentos} />
        <RecentBookings agendamentos={agendamentos} />
      </div>
    </DashboardLayout>
  );
}
