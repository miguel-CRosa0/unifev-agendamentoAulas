import { CalendarPlus, MapPin, User } from "lucide-react";

import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import type { Agendamento } from "./data";

function hojeISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function agoraHHMM() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  });
}

// Quadro de horários do dia, no estilo de um painel de avisos da secretaria
export function HojePanel({ agendamentos }: { agendamentos: Agendamento[] }) {
  const { openNovoAgendamento } = useStore();
  const hoje = hojeISO();
  const agora = agoraHHMM();
  const doDia = agendamentos
    .filter((a) => a.data === hoje && a.status !== "cancelado")
    .sort((x, y) => x.horaInicio.localeCompare(y.horaInicio));

  return (
    <section
      aria-labelledby="hoje-titulo"
      className="flex flex-col overflow-hidden rounded-lg bg-sidebar text-sidebar-foreground"
    >
      <div className="flex items-end justify-between gap-4 border-b border-sidebar-border px-6 pb-4 pt-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ouro">Quadro do dia</p>
          <h2 id="hoje-titulo" className="mt-1 text-2xl text-white">
            Aulas e reservas de hoje
          </h2>
        </div>
        <p className="font-serif text-3xl font-semibold tabular-nums text-white/90">{agora}</p>
      </div>

      {doDia.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6 py-10">
          <p className="text-lg text-sidebar-foreground/85">Nenhuma sala reservada para hoje.</p>
          <Button
            onClick={() => openNovoAgendamento()}
            className="bg-ouro text-ouro-foreground hover:bg-ouro/90"
          >
            <CalendarPlus /> Reservar uma sala
          </Button>
        </div>
      ) : (
        <ol className="divide-y divide-sidebar-border">
          {doDia.map((a) => {
            const emAndamento = a.horaInicio <= agora && agora < a.horaFim;
            const encerrada = a.horaFim <= agora;
            return (
              <li
                key={a.id}
                className={`grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 px-6 py-4 ${
                  emAndamento ? "bg-sidebar-accent" : ""
                } ${encerrada ? "opacity-60" : ""}`}
              >
                <div className="font-serif tabular-nums leading-tight">
                  <p className="text-2xl font-semibold text-white">{a.horaInicio}</p>
                  <p className="text-sm text-sidebar-foreground/70">até {a.horaFim}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white">{a.disciplina}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-sidebar-foreground/80">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {a.salaCodigo} · {a.salaNome}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {a.professorResponsavel}
                    </span>
                  </p>
                </div>
                <span
                  className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                    emAndamento
                      ? "bg-ouro text-ouro-foreground"
                      : a.status === "pendente"
                        ? "border border-ouro/60 text-ouro"
                        : "border border-white/25 text-sidebar-foreground/85"
                  }`}
                >
                  {emAndamento ? "Agora" : encerrada ? "Encerrada" : a.status === "pendente" ? "Pendente" : "Confirmada"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
