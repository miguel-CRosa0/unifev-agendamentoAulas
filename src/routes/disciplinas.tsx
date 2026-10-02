import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarPlus,
  DoorOpen,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useStore, type DisciplinaItem } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
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
import { NovaDisciplinaDialog } from "@/components/dashboard/nova-disciplina-dialog";

export const Route = createFileRoute("/disciplinas")({
  component: DisciplinasPage,
  head: () => ({
    meta: [
      { title: "Disciplinas e turmas — SalaFácil" },
      { name: "description", content: "Disciplinas, turmas e professores responsáveis vinculados aos agendamentos." },
      { property: "og:title", content: "Disciplinas e turmas — SalaFácil" },
      { property: "og:description", content: "Vínculo entre disciplinas, turmas e professores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function DisciplinasPage() {
  const { disciplinas, deleteDisciplina, openNovoAgendamento } = useStore();

  const [search, setSearch] = useState("");
  const [filterTurno, setFilterTurno] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState<DisciplinaItem | null>(null);

  const filtered = disciplinas.filter((d) => {
    const matchesSearch =
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.codigo.toLowerCase().includes(search.toLowerCase()) ||
      d.turma.toLowerCase().includes(search.toLowerCase()) ||
      d.professor.toLowerCase().includes(search.toLowerCase());

    const matchesTurno = filterTurno === "todos" || d.turno === filterTurno;

    return matchesSearch && matchesTurno;
  });

  const handleDelete = (d: DisciplinaItem) => {
    if (confirm(`Excluir a disciplina ${d.codigo} — ${d.nome}?`)) {
      deleteDisciplina(d.id);
      toast.success(`Disciplina ${d.codigo} removida.`);
    }
  };

  const handleEdit = (d: DisciplinaItem) => {
    setEditingDisc(d);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <NovaDisciplinaDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingDisc(null);
        }}
        disciplinaToEdit={editingDisc}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Disciplinas e Turmas</h1>
            <p className="text-sm text-muted-foreground">
              {disciplinas.length} disciplinas cadastradas · Gerenciamento acadêmico e alocação de salas
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingDisc(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nova disciplina
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome, professor ou turma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={filterTurno === "todos" ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setFilterTurno("todos")}
            >
              Todos ({disciplinas.length})
            </Button>
            <Button
              variant={filterTurno === "Matutino" ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setFilterTurno("Matutino")}
            >
              Matutino ({disciplinas.filter((d) => d.turno === "Matutino").length})
            </Button>
            <Button
              variant={filterTurno === "Vespertino" ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setFilterTurno("Vespertino")}
            >
              Vespertino ({disciplinas.filter((d) => d.turno === "Vespertino").length})
            </Button>
            <Button
              variant={filterTurno === "Noturno" ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setFilterTurno("Noturno")}
            >
              Noturno ({disciplinas.filter((d) => d.turno === "Noturno").length})
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center bg-card">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium text-foreground">Nenhuma disciplina encontrada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Altere o filtro de turno ou adicione uma nova disciplina.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card
                key={d.id}
                className="flex flex-col justify-between border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="border-transparent bg-primary/10 text-primary font-bold text-xs">
                          {d.codigo}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {d.turno}
                        </Badge>
                        {d.semestre && (
                          <span className="text-[11px] text-muted-foreground">
                            {d.semestre}
                          </span>
                        )}
                      </div>
                      <CardTitle className="flex items-start gap-2 text-base font-semibold text-foreground">
                        {d.nome}
                      </CardTitle>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEdit(d)} className="cursor-pointer">
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openNovoAgendamento(d.salaPadrao, d.codigo)}
                          className="cursor-pointer"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 mr-2" /> Agendar Sala
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(d)} className="text-destructive cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium text-foreground">{d.turma}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      Docente: <span className="text-foreground">{d.professor}</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" /> {d.alunos} alunos matriculados
                      </span>
                      {d.salaPadrao && (
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <DoorOpen className="h-3.5 w-3.5" /> {d.salaPadrao}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={() => handleEdit(d)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => openNovoAgendamento(d.salaPadrao, d.codigo)}
                    >
                      <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Agendar Aula
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
