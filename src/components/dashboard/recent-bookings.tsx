import { useState } from "react";
import {
  CalendarDays,
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
      return "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300";
    case "pendente":
      return "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300";
    case "cancelado":
      return "bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300";
    default:
      return "";
  }
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

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Agendamentos
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Clique em uma linha para ver os detalhes. Use os filtros para encontrar uma reserva.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openNovoAgendamento()}
                variant="outline"
              >
                <CalendarPlus /> Novo agendamento
              </Button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por disciplina, professor, sala ou turma"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11"
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
              <Button
                variant={filterStatus === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("todos")}
              >
                Todos ({agendamentos.length})
              </Button>
              <Button
                variant={filterStatus === "confirmado" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("confirmado")}
              >
                Confirmados ({agendamentos.filter((a) => a.status === "confirmado").length})
              </Button>
              <Button
                variant={filterStatus === "pendente" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pendente")}
              >
                Pendentes ({agendamentos.filter((a) => a.status === "pendente").length})
              </Button>
              <Button
                variant={filterStatus === "cancelado" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("cancelado")}
              >
                Cancelados ({agendamentos.filter((a) => a.status === "cancelado").length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Disciplina / Turma</TableHead>
                  <TableHead>Espaço / Sala</TableHead>
                  <TableHead>Data e Horário</TableHead>
                  <TableHead>Professor Responsável</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Nenhum agendamento encontrado para os filtros selecionados.
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
                        <div className="text-sm text-muted-foreground">
                          {ag.disciplinaCodigo} · {ag.turma}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{ag.salaCodigo}</div>
                        <div className="text-sm text-muted-foreground">{ag.salaLocalizacao}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {ag.data.split("-").reverse().join("/")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ag.horaInicio} — {ag.horaFim}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{ag.professorResponsavel}</TableCell>
                      <TableCell>
                        <div className="text-foreground">{ag.solicitanteNome}</div>
                        <div className="text-sm text-muted-foreground">{ag.solicitantePerfil}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${statusColor(ag.status)}`}>
                          {ag.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {ag.status === "pendente" && isGestao && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 text-emerald-800 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
                              title="Aprovar reserva"
                              onClick={(e) => handleQuickApprove(e, ag.id)}
                            >
                              <CheckCircle2 /> Aprovar
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" aria-label="Mais ações">
                                <MoreHorizontal className="!size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleOpenDetails(ag)} className="cursor-pointer">
                                Ver Detalhes
                              </DropdownMenuItem>
                              {ag.status === "pendente" && isGestao && (
                                <DropdownMenuItem
                                  onClick={(e) => handleQuickApprove(e, ag.id)}
                                  className="text-emerald-600 cursor-pointer"
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
        </CardContent>
      </Card>
    </>
  );
}
