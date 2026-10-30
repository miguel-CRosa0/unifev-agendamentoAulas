import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Download, FileBarChart, PieChart, Users } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HORARIOS_AULA, minutosDoDia, type Agendamento } from "@/components/dashboard/data";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
  head: () => ({
    meta: [
      { title: "Relatórios de uso — Agendamento de Aulas" },
      { name: "description", content: "Relatórios de ocupação de salas e laboratórios por período, com horas de uso e exportação." },
      { property: "og:title", content: "Relatórios de uso — Agendamento de Aulas" },
      { property: "og:description", content: "Taxa de ocupação e horas de uso das salas por período." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Periodo = "semana" | "mes" | "semestre" | "ano" | "todos";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Minutos de aula disponíveis por sala em um dia letivo (soma dos horários de aula)
const MINUTOS_POR_DIA = HORARIOS_AULA.reduce((t, h) => t + minutosDoDia(h.fim) - minutosDoDia(h.inicio), 0);

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dataBR(isoData: string) {
  return isoData.split("-").reverse().join("/");
}

function duracao(a: Agendamento) {
  return minutosDoDia(a.horaFim) - minutosDoDia(a.horaInicio);
}

/** Intervalo [início, fim] (AAAA-MM-DD) do período, tomando hoje no fuso de Brasília. */
function intervalo(periodo: Exclude<Periodo, "todos">, hoje: Date) {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  switch (periodo) {
    case "semana": {
      // Segunda a domingo da semana atual
      const inicio = new Date(ano, mes, hoje.getDate() - ((hoje.getDay() + 6) % 7));
      const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
      return { inicio: iso(inicio), fim: iso(fim) };
    }
    case "mes":
      return { inicio: iso(new Date(ano, mes, 1)), fim: iso(new Date(ano, mes + 1, 0)) };
    case "semestre":
      return mes < 6
        ? { inicio: `${ano}-01-01`, fim: `${ano}-06-30` }
        : { inicio: `${ano}-07-01`, fim: `${ano}-12-31` };
    case "ano":
      return { inicio: `${ano}-01-01`, fim: `${ano}-12-31` };
  }
}

/** Dias letivos (segunda a sábado) entre duas datas, inclusive. */
function diasLetivos(inicio: string, fim: string) {
  const [ai, mi, di] = inicio.split("-").map(Number) as [number, number, number];
  const [af, mf, df] = fim.split("-").map(Number) as [number, number, number];
  const d = new Date(ai, mi - 1, di);
  const ultimo = new Date(af, mf - 1, df);
  let dias = 0;
  while (d <= ultimo) {
    if (d.getDay() !== 0) dias++;
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

function celulaCSV(valor: string | number) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

function RelatoriosPage() {
  const { agendamentos, salas } = useStore();
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  // "Hoje" no fuso de Brasília, como data local (sem hora)
  const hoje = useMemo(() => {
    const [a, m, d] = new Date()
      .toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })
      .split("-")
      .map(Number) as [number, number, number];
    return new Date(a, m - 1, d);
  }, []);

  const opcoes: { value: Periodo; label: string }[] = [
    { value: "semana", label: "Semana atual" },
    { value: "mes", label: `${MESES[hoje.getMonth()]} / ${hoje.getFullYear()}` },
    { value: "semestre", label: `${hoje.getMonth() < 6 ? 1 : 2}º semestre / ${hoje.getFullYear()}` },
    { value: "ano", label: `Ano de ${hoje.getFullYear()}` },
    { value: "todos", label: "Todo o período" },
  ];

  const relatorio = useMemo(() => {
    let faixa: { inicio: string; fim: string } | null;
    if (periodo === "todos") {
      const datas = agendamentos.map((a) => a.data).sort();
      faixa = datas.length > 0 ? { inicio: datas[0]!, fim: datas[datas.length - 1]! } : null;
    } else {
      faixa = intervalo(periodo, hoje);
    }

    const doPeriodo = faixa
      ? agendamentos
          .filter((a) => a.data >= faixa.inicio && a.data <= faixa.fim)
          .sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
      : [];
    const confirmados = doPeriodo.filter((a) => a.status === "confirmado");
    const pendentes = doPeriodo.filter((a) => a.status === "pendente");
    const cancelados = doPeriodo.filter((a) => a.status === "cancelado");

    const minutosConfirmados = confirmados.reduce((t, a) => t + duracao(a), 0);
    const minutosDisponiveisPorSala = faixa ? diasLetivos(faixa.inicio, faixa.fim) * MINUTOS_POR_DIA : 0;
    const minutosDisponiveis = minutosDisponiveisPorSala * salas.length;

    const taxaOcupacao =
      minutosDisponiveis > 0 ? Math.min(100, Math.round((minutosConfirmados / minutosDisponiveis) * 100)) : 0;
    const mediaAlunos =
      confirmados.length > 0 ? Math.round(confirmados.reduce((t, a) => t + a.alunos, 0) / confirmados.length) : 0;

    const porSala = salas
      .map((s) => {
        const daSala = confirmados.filter((a) => a.salaCodigo === s.codigo);
        const minutos = daSala.reduce((t, a) => t + duracao(a), 0);
        return {
          ...s,
          confirmados: daSala.length,
          pendentes: pendentes.filter((a) => a.salaCodigo === s.codigo).length,
          horas: minutos / 60,
          totalAlunos: daSala.reduce((t, a) => t + a.alunos, 0),
          pct:
            minutosDisponiveisPorSala > 0
              ? Math.min(100, Math.round((minutos / minutosDisponiveisPorSala) * 100))
              : 0,
        };
      })
      .sort((a, b) => b.horas - a.horas || a.codigo.localeCompare(b.codigo));

    return {
      faixa,
      doPeriodo,
      confirmados,
      pendentes,
      cancelados,
      horas: minutosConfirmados / 60,
      taxaOcupacao,
      mediaAlunos,
      porSala,
      salasUsadas: porSala.filter((s) => s.confirmados > 0).length,
    };
  }, [agendamentos, salas, periodo, hoje]);

  const formatarHoras = (h: number) =>
    `${h.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h`;

  const exportarCSV = () => {
    if (relatorio.doPeriodo.length === 0) {
      toast.error("Não há agendamentos no período selecionado.");
      return;
    }
    const cabecalho = [
      "Data", "Início", "Fim", "Duração (min)", "Sala", "Nome da sala", "Disciplina",
      "Código", "Turma", "Professor", "Solicitante", "Status", "Alunos",
    ];
    const linhas = relatorio.doPeriodo.map((a) => [
      dataBR(a.data), a.horaInicio, a.horaFim, duracao(a), a.salaCodigo, a.salaNome, a.disciplina,
      a.disciplinaCodigo, a.turma, a.professorResponsavel, a.solicitanteNome, a.status, a.alunos,
    ]);
    const csv = [cabecalho, ...linhas].map((l) => l.map(celulaCSV).join(";")).join("\r\n");

    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = relatorio.faixa
      ? `agendamentos_${relatorio.faixa.inicio}_a_${relatorio.faixa.fim}.csv`
      : "agendamentos.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Relatório exportado com ${relatorio.doPeriodo.length} agendamento(s).`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Relatórios de Uso e Ocupação</h1>
            <p className="text-sm text-muted-foreground">
              {relatorio.faixa
                ? `Período de ${dataBR(relatorio.faixa.inicio)} a ${dataBR(relatorio.faixa.fim)}.`
                : "Nenhum agendamento registrado ainda."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
              <SelectTrigger className="w-48 text-xs h-9 bg-card">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {opcoes.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportarCSV} variant="outline" className="gap-1.5 h-9 text-xs font-medium">
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Horas de Uso
                </p>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{formatarHoras(relatorio.horas)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Soma das reservas confirmadas</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Taxa de Ocupação
                </p>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <PieChart className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{relatorio.taxaOcupacao}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {relatorio.salasUsadas} de {salas.length} salas utilizadas no período
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reservas no Período
                </p>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{relatorio.doPeriodo.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {relatorio.confirmados.length} confirmadas · {relatorio.pendentes.length} pendentes ·{" "}
                {relatorio.cancelados.length} canceladas
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Média de Alunos
                </p>
                <div className="p-2 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{relatorio.mediaAlunos}</p>
              <p className="mt-1 text-xs text-muted-foreground">Por reserva confirmada</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileBarChart className="h-5 w-5 text-primary" />
              Ocupação por Sala
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Horas reservadas (confirmadas) em relação às horas de aula disponíveis no período, de segunda a sábado.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatorio.porSala.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                Nenhuma sala cadastrada.
              </div>
            ) : (
              relatorio.porSala.map((s) => (
                <div key={s.id} className="space-y-1.5 rounded-lg border border-border bg-background p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                    <div>
                      <span className="font-bold text-primary mr-2">{s.codigo}</span>
                      <span className="font-semibold text-foreground">{s.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">({s.localizacao})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        <strong>{s.confirmados}</strong> confirmada(s)
                        {s.pendentes > 0 && <> · <strong>{s.pendentes}</strong> pendente(s)</>}
                      </span>
                      <span className="text-muted-foreground">
                        <strong>{formatarHoras(s.horas)}</strong> de uso
                      </span>
                      <span className="text-muted-foreground">
                        <strong>{s.totalAlunos}</strong> alunos atendidos
                      </span>
                      <span className="font-bold text-foreground bg-secondary px-2 py-0.5 rounded">
                        {s.pct}% ocupação
                      </span>
                    </div>
                  </div>
                  <Progress value={s.pct} className="h-2.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
