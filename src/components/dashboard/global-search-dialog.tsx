import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  DoorOpen,
  FileBarChart,
  MapPin,
  Plus,
  User,
  Users,
} from "lucide-react";

import { useStore } from "@/context/store-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const { salas, agendamentos, disciplinas, usuarios, openNovoAgendamento } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar salas, disciplinas, horários, professores..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              openNovoAgendamento();
            }}
          >
            <CalendarPlus className="mr-2 h-4 w-4 text-primary" />
            <span>Novo Agendamento de Sala</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              navigate({ to: "/salas" });
            }}
          >
            <Plus className="mr-2 h-4 w-4 text-primary" />
            <span>Gerenciar / Cadastrar Salas</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              navigate({ to: "/relatorios" });
            }}
          >
            <FileBarChart className="mr-2 h-4 w-4 text-primary" />
            <span>Consultar Relatórios e Exportar</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Salas e Laboratórios">
          {salas.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.codigo} ${s.nome} ${s.localizacao}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/salas" });
              }}
            >
              <DoorOpen className="mr-2 h-4 w-4 text-primary" />
              <div className="flex flex-1 items-center justify-between">
                <span>
                  <strong>{s.codigo}</strong> — {s.nome}
                </span>
                <span className="text-xs text-muted-foreground">
                  {s.capacidade} lug. · {s.status}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Disciplinas e Turmas">
          {disciplinas.map((d) => (
            <CommandItem
              key={d.id}
              value={`${d.codigo} ${d.nome} ${d.turma} ${d.professor}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/disciplinas" });
              }}
            >
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              <div className="flex flex-1 items-center justify-between">
                <span>
                  <strong>{d.codigo}</strong> — {d.nome}
                </span>
                <span className="text-xs text-muted-foreground">{d.turma}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Agendamentos">
          {agendamentos.slice(0, 10).map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.disciplina} ${a.salaCodigo} ${a.turma} ${a.professorResponsavel}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/agendamentos" });
              }}
            >
              <CalendarDays className="mr-2 h-4 w-4 text-primary" />
              <div className="flex flex-1 items-center justify-between">
                <span>
                  {a.disciplina} · <strong>{a.salaCodigo}</strong>
                </span>
                <span className="text-xs text-muted-foreground">
                  {a.data.split("-").reverse().join("/")} ({a.horaInicio})
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Usuários">
          {usuarios.map((u) => (
            <CommandItem
              key={u.id}
              value={`${u.nome} ${u.email} ${u.perfil}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/usuarios" });
              }}
            >
              <User className="mr-2 h-4 w-4 text-primary" />
              <div className="flex flex-1 items-center justify-between">
                <span>{u.nome}</span>
                <span className="text-xs text-muted-foreground">{u.perfil}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
