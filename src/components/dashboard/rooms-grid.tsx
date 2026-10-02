import { useState } from "react";
import {
  CalendarPlus,
  Check,
  DoorOpen,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Wrench,
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
import { NovaSalaDialog } from "@/components/dashboard/nova-sala-dialog";
import { SalaDetailsDialog } from "@/components/dashboard/sala-details-dialog";
import type { Sala, StatusSala } from "./data";

function statusColor(status: Sala["status"]) {
  switch (status) {
    case "disponível":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent";
    case "ocupada":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-transparent";
    case "manutenção":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent";
    default:
      return "";
  }
}

function statusIcon(status: Sala["status"]) {
  switch (status) {
    case "disponível":
      return <Check className="h-3 w-3" />;
    case "ocupada":
      return <Users className="h-3 w-3" />;
    case "manutenção":
      return <Wrench className="h-3 w-3" />;
    default:
      return null;
  }
}

export function RoomsGrid({ salas }: { salas: Sala[] }) {
  const { setSalaStatus, deleteSala, openNovoAgendamento } = useStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");

  // Dialog states
  const [novaSalaOpen, setNovaSalaOpen] = useState(false);
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [salaToEdit, setSalaToEdit] = useState<Sala | null>(null);

  const filteredSalas = salas.filter((sala) => {
    const matchesSearch =
      sala.codigo.toLowerCase().includes(search.toLowerCase()) ||
      sala.nome.toLowerCase().includes(search.toLowerCase()) ||
      sala.localizacao.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "todos" || sala.status === filterStatus;

    let matchesType = true;
    if (filterType === "lab") {
      matchesType = sala.codigo.startsWith("LAB") || sala.nome.toLowerCase().includes("laboratório");
    } else if (filterType === "sala") {
      matchesType = sala.codigo.startsWith("SAL") || sala.nome.toLowerCase().includes("sala");
    } else if (filterType === "aud") {
      matchesType = sala.codigo.startsWith("AUD") || sala.nome.toLowerCase().includes("auditório");
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (sala: Sala) => {
    if (confirm(`Tem certeza que deseja excluir a sala ${sala.codigo}?`)) {
      deleteSala(sala.id);
      toast.success(`Sala ${sala.codigo} excluída.`);
    }
  };

  const handleEdit = (sala: Sala) => {
    setSalaToEdit(sala);
    setNovaSalaOpen(true);
  };

  const handleOpenDetails = (sala: Sala) => {
    setSelectedSala(sala);
    setDetailsOpen(true);
  };

  return (
    <>
      <NovaSalaDialog
        open={novaSalaOpen}
        onOpenChange={(v) => {
          setNovaSalaOpen(v);
          if (!v) setSalaToEdit(null);
        }}
        salaToEdit={salaToEdit}
      />

      <SalaDetailsDialog
        sala={selectedSala}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={(s) => handleEdit(s)}
      />

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-primary" />
                Catálogo de Salas e Laboratórios
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Código, capacidade, recursos multimídia e disponibilidade em tempo real
              </p>
            </div>
            <Button
              onClick={() => {
                setSalaToEdit(null);
                setNovaSalaOpen(true);
              }}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nova sala
            </Button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código (ex: LAB-101), nome ou bloco..."
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
                Todas ({salas.length})
              </Button>
              <Button
                variant={filterStatus === "disponível" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("disponível")}
              >
                Livres ({salas.filter((s) => s.status === "disponível").length})
              </Button>
              <Button
                variant={filterStatus === "ocupada" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("ocupada")}
              >
                Ocupadas ({salas.filter((s) => s.status === "ocupada").length})
              </Button>
              <Button
                variant={filterStatus === "manutenção" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterStatus("manutenção")}
              >
                Manutenção ({salas.filter((s) => s.status === "manutenção").length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredSalas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <DoorOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium text-foreground">Nenhuma sala encontrada</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tente redefinir os filtros de busca ou cadastre uma nova sala.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("todos");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSalas.map((sala) => (
                <div
                  key={sala.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          {sala.codigo}
                        </span>
                        <h3
                          className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleOpenDetails(sala)}
                        >
                          {sala.nome}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{sala.localizacao}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={`flex shrink-0 items-center gap-1 capitalize text-xs ${statusColor(
                            sala.status
                          )}`}
                        >
                          {statusIcon(sala.status)}
                          {sala.status}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleOpenDetails(sala)} className="cursor-pointer">
                              Ver Detalhes e Agenda
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(sala)} className="cursor-pointer">
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Editar Sala
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSalaStatus(sala.id, "disponível")}
                              className="cursor-pointer"
                            >
                              Marcar como Disponível
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSalaStatus(sala.id, "ocupada")}
                              className="cursor-pointer"
                            >
                              Marcar como Ocupada
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSalaStatus(sala.id, "manutenção")}
                              className="cursor-pointer"
                            >
                              Marcar como Manutenção
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(sala)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Sala
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Capacidade: {sala.capacidade} alunos
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sala.recursos &&
                        sala.recursos.slice(0, 4).map((recurso) => (
                          <span
                            key={recurso.id}
                            title={recurso.descricao}
                            className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                          >
                            {recurso.nome}
                          </span>
                        ))}
                      {sala.recursos && sala.recursos.length > 4 && (
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          +{sala.recursos.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenDetails(sala)}
                    >
                      Ver detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => openNovoAgendamento(sala.codigo)}
                    >
                      <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Reservar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
