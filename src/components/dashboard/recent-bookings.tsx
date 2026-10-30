import { useState } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgendamentoDetailsDialog } from "@/components/dashboard/agendamento-details-dialog";
import type { Agendamento } from "./data";

function statusColor(status: Agendamento["status"]) {
  switch (status) {
    case "confirmado":
      return "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent";
    case "pendente":
      return "bg-slate-50 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-transparent";
    case "cancelado":
      return "bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-transparent";
    default:
      return "";
  }
}

function VazioAgendamentos({ semDados, onNovo }: { semDados: boolean; onNovo: () => void }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
        <CalendarPlus className="h-5 w-5" />
      </span>
      <p className="mt-4 font-medium text-foreground">
        {semDados ? "Nenhum agendamento ainda" : "Nada encontrado"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {semDados
          ? "Reserve a primeira sala para começar a montar a grade de aulas."
          : "Tente outra busca ou mude o filtro de status."}
      </p>
      {semDados && (
        <Button className="mt-4" onClick={onNovo}>
          Novo agendamento
        </Button>
      )}
    </div>
  );
}

export function RecentBookings({ agendamentos }: { agendamentos: Agendamento[] }) {
  const {
    openNovoAgendamento,
    updateAgendamentoStatus,
    deleteAgendamento,
    currentUser,
    isGestao,
  } = useStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedBooking, setSelectedBooking] = useState<Agendamento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filtered = agendamentos.filter((a) => {
    const matchesSearch =
      a.disciplina.toLowerCase().includes(search.toLowerCase()) ||
      a.disciplinaCodigo.toLowerCase().includes(search.toLowerCase()) ||
      a.salaCodigo.toLowerCase().includes(search.toLowerCase()) ||
      a.professorResponsavel.toLowerCase().includes(search.toLowerCase()) ||
      a.turma.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "todos" || a.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (ag: Agendamento) => {
    setSelectedBooking(ag);
    setDetailsOpen(true);
  };

  const handleQuickApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!(await updateAgendamentoStatus(id, "confirmado"))) return;
    toast.success("Agendamento aprovado com sucesso!");
  };

  const handleQuickCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!(await updateAgendamentoStatus(id, "cancelado"))) return;
    toast.success("Agendamento cancelado.");
  };

  const handleQuickDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remover este agendamento?")) {
      if (await deleteAgendamento(id)) toast.success("Agendamento removido.");
    }
  };

  return (
    <>
      <AgendamentoDetailsDialog
        agendamento={selectedBooking}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Agendamentos</CardTitle>
              <p className="text-[13px] text-muted-foreground">Horários, solicitações e status por disciplina.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openNovoAgendamento()}
                size="sm"
                className="gap-1.5"
              >
                <CalendarPlus className="h-4 w-4" /> Novo agendamento
              </Button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por disciplina, professor, sala ou turma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={filterStatus === "todos" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("todos")}
              >
                Todos ({agendamentos.length})
              </Button>
              <Button
                variant={filterStatus === "confirmado" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("confirmado")}
              >
                Confirmados ({agendamentos.filter((a) => a.status === "confirmado").length})
              </Button>
              <Button
                variant={filterStatus === "pendente" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("pendente")}
              >
                Pendentes ({agendamentos.filter((a) => a.status === "pendente").length})
              </Button>
              <Button
                variant={filterStatus === "cancelado" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("cancelado")}
              >
                Cancelados ({agendamentos.filter((a) => a.status === "cancelado").length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Disciplina / Turma</TableHead>
                  <TableHead className="text-muted-foreground">Espaço / Sala</TableHead>
                  <TableHead className="text-muted-foreground">Data e Horário</TableHead>
                  <TableHead className="text-muted-foreground">Professor Responsável</TableHead>
                  <TableHead className="text-muted-foreground">Solicitante</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="py-12">
                      <VazioAgendamentos semDados={agendamentos.length === 0} onNovo={() => openNovoAgendamento()} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ag) => (
                    <TableRow
                      key={ag.id}
                      className="border-border cursor-pointer hover:bg-accent/40 transition-colors"
                      onClick={() => handleOpenDetails(ag)}
                    >
                      <TableCell>
                        <div className="font-semibold text-foreground">{ag.disciplina}</div>
                        <div className="text-xs text-muted-foreground">
                          {ag.disciplinaCodigo} · {ag.turma}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{ag.salaCodigo}</div>
                        <div className="text-xs text-muted-foreground">{ag.salaLocalizacao}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {ag.data.split("-").reverse().join("/")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ag.horaInicio} — {ag.horaFim}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{ag.professorResponsavel}</TableCell>
                      <TableCell>
                        <div className="text-foreground">{ag.solicitanteNome}</div>
                        <div className="text-xs text-muted-foreground">{ag.solicitantePerfil}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize font-medium ${statusColor(ag.status)}`}>
                          {ag.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {ag.status === "pendente" && isGestao && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              title="Aprovar reserva"
                              onClick={(e) => handleQuickApprove(e, ag.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aprovar
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleOpenDetails(ag)} className="cursor-pointer">
                                Ver Detalhes
                              </DropdownMenuItem>
                              {ag.status === "pendente" && isGestao && (
                                <DropdownMenuItem
                                  onClick={(e) => handleQuickApprove(e, ag.id)}
                                  className="text-blue-600 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Aprovar Reserva
                                </DropdownMenuItem>
                              )}
                              {ag.status !== "cancelado" && (isGestao || ag.solicitanteId === currentUser.id) && (
                                <DropdownMenuItem
                                  onClick={(e) => handleQuickCancel(e, ag.id)}
                                  className="text-rose-600 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-2" /> Cancelar Reserva
                                </DropdownMenuItem>
                              )}
                              {isGestao && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => handleQuickDelete(e, ag.id)}
                                    className="text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {filtered.length === 0 && (
              <li className="px-4 py-10">
                <VazioAgendamentos semDados={agendamentos.length === 0} onNovo={() => openNovoAgendamento()} />
              </li>
            )}
            {filtered.map((ag) => (
              <li key={ag.id}>
                <button
                  type="button"
                  onClick={() => handleOpenDetails(ag)}
                  className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{ag.disciplina}</p>
                      <p className="text-xs text-muted-foreground">
                        {ag.disciplinaCodigo} · {ag.turma}
                      </p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 capitalize font-medium ${statusColor(ag.status)}`}>
                      {ag.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ag.data.split("-").reverse().join("/")} · {ag.horaInicio}–{ag.horaFim} · {ag.salaCodigo}
                  </p>
                  <p className="text-xs text-muted-foreground">{ag.professorResponsavel}</p>
                </button>
                {ag.status === "pendente" && isGestao && (
                  <div className="px-4 pb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-primary"
                      onClick={(e) => handleQuickApprove(e, ag.id)}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Aprovar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
