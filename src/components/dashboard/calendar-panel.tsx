import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function hojeISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export function CalendarPanel({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [hoje] = useState(hojeISO);
  const [ano, mes] = hoje.split("-").map(Number) as [number, number, number];
  const [cursor, setCursor] = useState({ ano, mes: mes - 1 });
  const [selecionado, setSelecionado] = useState(hoje);

  const porDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    for (const a of agendamentos) {
      map.set(a.data, [...(map.get(a.data) ?? []), a]);
    }
    for (const lista of map.values()) lista.sort((x, y) => x.horaInicio.localeCompare(y.horaInicio));
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
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
        <CardTitle className="text-base font-semibold text-foreground">Calendário</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="mr-1 h-8 text-xs"
            onClick={() => {
              setCursor({ ano, mes: mes - 1 });
              setSelecionado(hoje);
            }}
          >
            Hoje
          </Button>
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
          <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
              const ehHoje = chave === hoje;
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setSelecionado(chave)}
                  className={`flex aspect-[5/4] flex-col items-start justify-between rounded-md border p-2 text-left font-mono text-[13px] transition-colors ${
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : ehHoje
                        ? "border-primary/50 bg-card font-medium text-primary hover:bg-accent"
                        : "border-transparent text-foreground hover:border-border hover:bg-card"
                  }`}
                >
                  <span>{dia}</span>
                  <span className="flex items-center gap-0.5">
                    {itens.slice(0, 4).map((a) => (
                      <span key={a.id} className={`h-1 w-3 rounded-full ${ativo ? "bg-primary-foreground/80" : statusDot(a.status)}`} />
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

        <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs text-muted-foreground">Agendamentos do dia</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {selecionado.split("-").reverse().join("/")}
          </p>
          <div className="mt-4 space-y-3.5">
            {doDia.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento nesta data.</p>
            )}
            {doDia.map((a) => (
              <div key={a.id} className="border-l-2 border-border py-0.5 pl-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusDot(a.status)}`} />
                  <p className="truncate text-sm font-medium text-foreground">{a.disciplina}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-mono">{a.horaInicio}–{a.horaFim}</span> · {a.salaCodigo}
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
