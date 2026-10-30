import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoDetailsDialog } from "@/components/dashboard/agendamento-details-dialog";
import type { Agendamento } from "./data";

const ALTURA_HORA = 52;
const HORA_MIN_PADRAO = 7;
const HORA_MAX_PADRAO = 22;

function hojeISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function emMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

function somarDias(data: string, delta: number) {
  const d = new Date(`${data}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toLocaleDateString("sv-SE");
}

function dataLonga(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const estiloStatus: Record<Agendamento["status"], string> = {
  confirmado: "border-primary/30 bg-primary/10 text-primary",
  pendente: "border-slate-300 border-dashed bg-slate-100 text-slate-700",
  cancelado: "",
};

// Reservas sobrepostas na mesma sala dividem a largura da coluna
function distribuirFaixas(itens: Agendamento[]) {
  const ordenados = [...itens].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const faixas: number[] = [];
  const resultado = new Map<string, { faixa: number; total: number }>();
  let grupo: Agendamento[] = [];
  let fimGrupo = 0;

  const fechar = () => {
    const total = Math.max(1, ...grupo.map((a) => resultado.get(a.id)!.faixa + 1));
    for (const a of grupo) resultado.get(a.id)!.total = total;
    grupo = [];
    faixas.length = 0;
  };

  for (const a of ordenados) {
    const ini = emMinutos(a.horaInicio);
    if (grupo.length && ini >= fimGrupo) fechar();
    let faixa = faixas.findIndex((fim) => fim <= ini);
    if (faixa === -1) faixa = faixas.length;
    faixas[faixa] = emMinutos(a.horaFim);
    fimGrupo = Math.max(fimGrupo, emMinutos(a.horaFim));
    resultado.set(a.id, { faixa, total: 1 });
    grupo.push(a);
  }
  if (grupo.length) fechar();
  return resultado;
}

export function GradeSalas({ agendamentos }: { agendamentos: Agendamento[] }) {
  const { salas } = useStore();
  const [hoje] = useState(hojeISO);
  const [data, setData] = useState(hoje);
  const [aberto, setAberto] = useState<Agendamento | null>(null);

  const doDia = useMemo(
    () => agendamentos.filter((a) => a.data === data && a.status !== "cancelado"),
    [agendamentos, data],
  );

  const horaInicial = Math.min(HORA_MIN_PADRAO, ...doDia.map((a) => Math.floor(emMinutos(a.horaInicio) / 60)));
  const horaFinal = Math.max(HORA_MAX_PADRAO, ...doDia.map((a) => Math.ceil(emMinutos(a.horaFim) / 60)));
  const horas = Array.from({ length: horaFinal - horaInicial }, (_, i) => horaInicial + i);
  const altura = horas.length * ALTURA_HORA;

  const colunas = salas.filter((s) => s.status !== "manutenção");

  return (
    <>
      <AgendamentoDetailsDialog
        agendamento={aberto}
        open={aberto !== null}
        onOpenChange={(v) => !v && setAberto(null)}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Ocupação das salas</CardTitle>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{dataLonga(data)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="mr-1" onClick={() => setData(hoje)} disabled={data === hoje}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setData(somarDias(data, -1))} aria-label="Dia anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setData(somarDias(data, 1))} aria-label="Próximo dia">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {colunas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma sala cadastrada ainda.</p>
          ) : (
            <div className="max-h-[32rem] overflow-auto rounded-lg border border-border">
              <div className="flex min-w-max">
                <div className="sticky left-0 z-20 w-14 shrink-0 border-r border-border bg-card">
                  <div className="sticky top-0 z-30 h-10 border-b border-border bg-card" />
                  <div className="relative" style={{ height: altura }}>
                    {horas.map((h, i) => (
                      <span
                        key={h}
                        className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
                        style={{ top: i * ALTURA_HORA, display: i === 0 ? "none" : undefined }}
                      >
                        {String(h).padStart(2, "0")}:00
                      </span>
                    ))}
                  </div>
                </div>

                {colunas.map((sala) => {
                  const itens = doDia.filter((a) => a.salaCodigo === sala.codigo);
                  const faixas = distribuirFaixas(itens);
                  return (
                    <div key={sala.id} className="min-w-[9.5rem] flex-1 border-r border-border last:border-r-0">
                      <div className="sticky top-0 z-10 flex h-10 items-center justify-center border-b border-border bg-card px-2 text-center">
                        <span className="truncate text-sm font-medium text-foreground" title={sala.nome}>
                          {sala.codigo}
                        </span>
                      </div>
                      <div className="relative" style={{ height: altura }}>
                        {horas.map((h, i) => (
                          <div
                            key={h}
                            className="absolute inset-x-0 border-t border-border/70"
                            style={{ top: i * ALTURA_HORA }}
                          />
                        ))}
                        {itens.map((a) => {
                          const { faixa, total } = faixas.get(a.id)!;
                          const topo = ((emMinutos(a.horaInicio) - horaInicial * 60) / 60) * ALTURA_HORA;
                          const alt = Math.max(((emMinutos(a.horaFim) - emMinutos(a.horaInicio)) / 60) * ALTURA_HORA, 24);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setAberto(a)}
                              className={`absolute overflow-hidden rounded-md border px-2 py-1 text-left text-xs transition-colors hover:brightness-95 ${estiloStatus[a.status]}`}
                              style={{
                                top: topo + 1,
                                height: alt - 2,
                                left: `calc(${(faixa / total) * 100}% + 2px)`,
                                width: `calc(${100 / total}% - 4px)`,
                              }}
                              title={`${a.disciplina} · ${a.horaInicio}–${a.horaFim}`}
                            >
                              <span className="block truncate font-medium">{a.disciplina}</span>
                              <span className="block truncate opacity-80">
                                {a.horaInicio}–{a.horaFim}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-primary/30 bg-primary/10" /> Confirmado</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-dashed border-slate-300 bg-slate-100" /> Pendente</span>
            {doDia.length === 0 && <span>Nenhuma aula neste dia.</span>}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
