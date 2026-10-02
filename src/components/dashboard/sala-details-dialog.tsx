import { CalendarDays, Check, MapPin, Users, Wrench } from "lucide-react";

import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sala, StatusSala } from "@/components/dashboard/data";

interface SalaDetailsDialogProps {
  sala: Sala | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (sala: Sala) => void;
}

export function SalaDetailsDialog({
  sala,
  open,
  onOpenChange,
  onEdit,
}: SalaDetailsDialogProps) {
  const { agendamentos, setSalaStatus, openNovoAgendamento } = useStore();

  if (!sala) return null;

  const bookingsForRoom = agendamentos.filter(
    (a) => a.salaCodigo === sala.codigo && a.status !== "cancelado"
  );

  const handleStatusChange = (newStatus: StatusSala) => {
    setSalaStatus(sala.id, newStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {sala.codigo}
              </span>
              <DialogTitle className="text-xl font-bold text-foreground">
                {sala.nome}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {sala.localizacao}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-2.5 py-1 ${
                sala.status === "disponível"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent"
                  : sala.status === "ocupada"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-transparent"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent"
              }`}
            >
              {sala.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick info row */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Capacidade Máxima</p>
              <p className="text-base font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Users className="h-4 w-4 text-primary" /> {sala.capacidade} alunos sentados
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agendamentos Ativos</p>
              <p className="text-base font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="h-4 w-4 text-primary" /> {bookingsForRoom.length} reservas
              </p>
            </div>
          </div>

          {/* Quick status switcher */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Alterar Status Rápido:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={sala.status === "disponível" ? "default" : "outline"}
                className={sala.status === "disponível" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                onClick={() => handleStatusChange("disponível")}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Disponível
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sala.status === "ocupada" ? "default" : "outline"}
                className={sala.status === "ocupada" ? "bg-rose-600 hover:bg-rose-700" : ""}
                onClick={() => handleStatusChange("ocupada")}
              >
                <Users className="h-3.5 w-3.5 mr-1" /> Ocupada
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sala.status === "manutenção" ? "default" : "outline"}
                className={sala.status === "manutenção" ? "bg-amber-600 hover:bg-amber-700" : ""}
                onClick={() => handleStatusChange("manutenção")}
              >
                <Wrench className="h-3.5 w-3.5 mr-1" /> Manutenção
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Recursos Instalados:</p>
            <div className="flex flex-wrap gap-1.5">
              {sala.recursos && sala.recursos.length > 0 ? (
                sala.recursos.map((rec) => (
                  <span
                    key={rec.id}
                    title={rec.descricao}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {rec.nome}
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum recurso específico registrado.</p>
              )}
            </div>
          </div>

          {/* Schedule of this room */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próximos Agendamentos nesta Sala
            </h4>

            {bookingsForRoom.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Nenhum agendamento futuro para esta sala. Espaço totalmente livre.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bookingsForRoom.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-lg border border-border bg-background p-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-medium text-foreground">
                      <span>{b.disciplina} ({b.disciplinaCodigo})</span>
                      <span className="font-semibold text-primary">
                        {b.data.split("-").reverse().join("/")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{b.horaInicio} às {b.horaFim} · {b.turma}</span>
                      <span>{b.professorResponsavel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between pt-4 border-t border-border">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEdit(sala);
              }}
            >
              Editar Sala
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              openNovoAgendamento(sala.codigo);
            }}
          >
            + Agendar esta Sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
