import { AlertTriangle, Calendar, CheckCircle2, Clock, MapPin, Trash2, User, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

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
import type { Agendamento, StatusAgendamento } from "@/components/dashboard/data";

interface AgendamentoDetailsDialogProps {
  agendamento: Agendamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgendamentoDetailsDialog({
  agendamento,
  open,
  onOpenChange,
}: AgendamentoDetailsDialogProps) {
  const { updateAgendamentoStatus, deleteAgendamento, salas } = useStore();

  if (!agendamento) return null;

  const room = salas.find((s) => s.codigo === agendamento.salaCodigo);

  const handleStatusChange = (status: StatusAgendamento) => {
    updateAgendamentoStatus(agendamento.id, status);
    toast.success(`Agendamento ${status === "confirmado" ? "confirmado" : "cancelado"} com sucesso!`);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
      deleteAgendamento(agendamento.id);
      toast.success("Agendamento removido.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {agendamento.disciplinaCodigo}
              </span>
              <DialogTitle className="text-xl font-bold text-foreground">
                {agendamento.disciplina}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Turma: {agendamento.turma}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-2.5 py-1 ${
                agendamento.status === "confirmado"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent"
                  : agendamento.status === "pendente"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-transparent"
              }`}
            >
              {agendamento.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Data da Reserva
              </span>
              <p className="font-semibold text-foreground">
                {agendamento.data.split("-").reverse().join("/")}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Horário
              </span>
              <p className="font-semibold text-foreground">
                {agendamento.horaInicio} às {agendamento.horaFim}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Espaço / Sala
              </span>
              <p className="font-semibold text-foreground">
                {agendamento.salaCodigo} — {agendamento.salaNome}
              </p>
              <p className="text-xs text-muted-foreground">{agendamento.salaLocalizacao}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Alunos Previstos
              </span>
              <p className="font-semibold text-foreground">
                {agendamento.alunos} alunos
                {room && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    (capacidade: {room.capacidade})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* People involved */}
          <div className="rounded-lg border border-border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Professor Responsável:
              </span>
              <span className="font-medium text-foreground">{agendamento.professorResponsavel}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Solicitante:
              </span>
              <span className="font-medium text-foreground">
                {agendamento.solicitanteNome} ({agendamento.solicitantePerfil})
              </span>
            </div>
          </div>

          {agendamento.status === "pendente" && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Este agendamento foi solicitado e está aguardando homologação da coordenação ou do administrador para liberar a chave/sala.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row justify-between gap-2 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Excluir
          </Button>

          <div className="flex gap-2">
            {agendamento.status !== "cancelado" && (
              <Button
                type="button"
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                onClick={() => handleStatusChange("cancelado")}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Cancelar Reserva
              </Button>
            )}

            {agendamento.status !== "confirmado" && (
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusChange("confirmado")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirmar Reserva
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
