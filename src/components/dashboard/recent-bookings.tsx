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
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent";
    case "pendente":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent";
    case "cancelado":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-transparent";
    default:
      return "";
  }
}

export function RecentBookings({ agendamentos }: { agendamentos: Agendamento[] }) {
  const {
    openNovoAgendamento,
    updateAgendamentoStatus,
    deleteAgendamento,
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

  const handleQuickApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateAgendamentoStatus(id, "confirmado");
    toast.success("Agendamento aprovado com sucesso!");
  };

  const handleQuickCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateAgendamentoStatus(id, "cancelado");
    toast.success("Agendamento cancelado.");
  };

  const handleQuickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remover este agendamento?")) {
      deleteAgendamento(id);
      toast.success("Agendamento removido.");
    }
  };

  return (
    <>
      <AgendamentoDetailsDialog
        agendamento={selectedBooking}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Agendamentos Acadêmicos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Consulte horários, aprove solicitações de salas e filtre por status ou disciplina
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openNovoAgendamento()}
                size="sm"
                className="gap-1.5 shadow-sm"
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
          <div className="overflow-x-auto">
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
                          {ag.status === "pendente" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
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
                              {ag.status === "pendente" && (
                                <DropdownMenuItem
                                  onClick={(e) => handleQuickApprove(e, ag.id)}
                                  className="text-emerald-600 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Aprovar Reserva
                                </DropdownMenuItem>
                              )}
                              {ag.status !== "cancelado" && (
                                <DropdownMenuItem
                                  onClick={(e) => handleQuickCancel(e, ag.id)}
                                  className="text-rose-600 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-2" /> Cancelar Reserva
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => handleQuickDelete(e, ag.id)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                              </DropdownMenuItem>
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
