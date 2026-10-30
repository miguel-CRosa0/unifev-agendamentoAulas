import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, ChevronRight, Clock, DoorOpen, FileBarChart } from "lucide-react";

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

  const primeiroNome = currentUser.nome.split(" ")[0];
  const hora = Number(
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }),
  );
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const atalhos = [
    {
      icon: CalendarPlus,
      titulo: "Reservar uma sala",
      descricao: "Para aula, prova ou evento",
      onClick: () => openNovoAgendamento(),
    },
    {
      icon: DoorOpen,
      titulo: salasDisponiveis === 1 ? "1 sala livre" : `${salasDisponiveis} salas livres`,
      descricao: "Ver salas e laboratórios",
      to: "/salas" as const,
    },
    {
      icon: Clock,
      titulo:
        pendentesCount === 0
          ? "Nada pendente"
          : pendentesCount === 1
            ? "1 pedido pendente"
            : `${pendentesCount} pedidos pendentes`,
      descricao: "Revisar e aprovar reservas",
      to: "/agendamentos" as const,
    },
    {
      icon: FileBarChart,
      titulo: "Relatórios",
      descricao: "Ocupação e uso das salas",
      to: "/relatorios" as const,
    },
  ];

  const classeAtalho =
    "group flex items-center gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-secondary";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground first-letter:uppercase">{dataExtenso}</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">
              {saudacao}, {primeiroNome}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Aqui está o resumo das salas e dos agendamentos.
            </p>
          </div>
          <Button onClick={() => openNovoAgendamento()} size="lg" className="px-6">
            <CalendarPlus />
            Agendar sala
          </Button>
        </div>

        {/* Dynamic Indicators */}
        <StatsCards indicadores={indicadores} />

        {/* Atalhos */}
        <section aria-labelledby="atalhos">
          <h2 id="atalhos" className="mb-3 text-lg font-bold text-foreground">
            O que você deseja fazer?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {atalhos.map((atalho) => {
              const conteudo = (
                <>
                  <atalho.icon className="h-7 w-7 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-foreground">{atalho.titulo}</p>
                    <p className="text-sm text-muted-foreground">{atalho.descricao}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </>
              );
              return atalho.to ? (
                <Link key={atalho.titulo} to={atalho.to} className={classeAtalho}>
                  {conteudo}
                </Link>
              ) : (
                <button key={atalho.titulo} type="button" onClick={atalho.onClick} className={classeAtalho}>
                  {conteudo}
                </button>
              );
            })}
          </div>
        </section>

        {/* Interactive Calendar View */}
        <CalendarPanel agendamentos={agendamentos} />

        {/* Bookings Table with Interactive Actions */}
        <RecentBookings agendamentos={agendamentos} />
      </div>
    </DashboardLayout>
  );
}
