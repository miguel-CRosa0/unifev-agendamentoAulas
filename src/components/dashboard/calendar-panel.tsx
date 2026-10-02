import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agendamento } from "./data";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function iso(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function statusDot(status: Agendamento["status"]) {
  if (status === "confirmado") return "bg-primary";
  if (status === "pendente") return "bg-amber-500";
  return "bg-destructive";
}

export function CalendarPanel({ agendamentos }: { agendamentos: Agendamento[] }) {
  const base = agendamentos[0]?.data ?? "2026-09-03";
  const [ano, mes] = base.split("-").map(Number) as [number, number, number];
  const [cursor, setCursor] = useState({ ano, mes: mes - 1 });
  const [selecionado, setSelecionado] = useState(base);

  const porDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    for (const a of agendamentos) {
      map.set(a.data, [...(map.get(a.data) ?? []), a]);
    }
    return map;
  }, [agendamentos]);

  const primeiroDiaSemana = new Date(cursor.ano, cursor.mes, 1).getDay();
  const totalDias = new Date(cursor.ano, cursor.mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const doDia = porDia.get(selecionado) ?? [];

  function mover(delta: number) {
    const d = new Date(cursor.ano, cursor.mes + delta, 1);
    setCursor({ ano: d.getFullYear(), mes: d.getMonth() });
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          Calendário de agendamentos
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => mover(-1)} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[8.5rem] text-center text-sm font-medium text-foreground">
            {MESES[cursor.mes]} {cursor.ano}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => mover(1)} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-medium uppercase text-muted-foreground">
            {DIAS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celulas.map((dia, i) => {
              if (dia === null) return <div key={`v-${i}`} />;
              const chave = iso(cursor.ano, cursor.mes, dia);
              const itens = porDia.get(chave) ?? [];
              const ativo = chave === selecionado;
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setSelecionado(chave)}
                  className={`flex aspect-square flex-col items-center justify-start gap-1 rounded-lg border p-1.5 text-sm transition-colors ${
                    ativo
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  <span>{dia}</span>
                  <span className="flex flex-wrap items-center justify-center gap-0.5">
                    {itens.slice(0, 3).map((a) => (
                      <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${statusDot(a.status)}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary" /> Confirmado</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" /> Pendente</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-destructive" /> Cancelado</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Agendamentos do dia</p>
          <p className="text-sm font-semibold text-foreground">
            {selecionado.split("-").reverse().join("/")}
          </p>
          <div className="mt-3 space-y-2">
            {doDia.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento nesta data.</p>
            )}
            {doDia.map((a) => (
              <div key={a.id} className="rounded-md border border-border p-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusDot(a.status)}`} />
                  <p className="truncate text-sm font-medium text-foreground">{a.disciplina}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.horaInicio}–{a.horaFim} · {a.salaCodigo}
                </p>
                <p className="text-xs text-muted-foreground">{a.professorResponsavel}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
