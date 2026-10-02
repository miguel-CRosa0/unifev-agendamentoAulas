import { useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  CheckCheck,
  Info,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Notificacao } from "./data";

function icon(tipo: Notificacao["tipo"]) {
  switch (tipo) {
    case "conflito":
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />;
    case "confirmacao":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "cancelamento":
      return <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />;
    default:
      return <Info className="h-5 w-5 text-primary shrink-0" />;
  }
}

function tipoBadge(tipo: Notificacao["tipo"]) {
  switch (tipo) {
    case "conflito":
      return "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/20";
    case "confirmacao":
      return "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20";
    case "cancelamento":
      return "border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/20";
    default:
      return "border-primary/20 text-primary bg-primary/5";
  }
}

export function NotificationsPanel({ notificacoes }: { notificacoes: Notificacao[] }) {
  const { deleteNotificacao, clearAllNotificacoes } = useStore();
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const filtered = notificacoes.filter((n) => {
    if (filterTipo === "todos") return true;
    return n.tipo === filterTipo;
  });

  const handleClearAll = () => {
    clearAllNotificacoes();
    toast.success("Todas as notificações foram limpas.");
  };

  const handleDelete = (id: string) => {
    deleteNotificacao(id);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <BellRing className="h-5 w-5 text-primary" />
              Central de Notificações
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Avisos em tempo real de conflitos de horário, confirmações, cancelamentos e mensagens do sistema
            </p>
          </div>

          {notificacoes.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
              </Button>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Button
            variant={filterTipo === "todos" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterTipo("todos")}
          >
            Todas ({notificacoes.length})
          </Button>
          <Button
            variant={filterTipo === "conflito" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterTipo("conflito")}
          >
            Conflitos ({notificacoes.filter((n) => n.tipo === "conflito").length})
          </Button>
          <Button
            variant={filterTipo === "confirmacao" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterTipo("confirmacao")}
          >
            Confirmações ({notificacoes.filter((n) => n.tipo === "confirmacao").length})
          </Button>
          <Button
            variant={filterTipo === "cancelamento" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterTipo("cancelamento")}
          >
            Cancelamentos ({notificacoes.filter((n) => n.tipo === "cancelamento").length})
          </Button>
          <Button
            variant={filterTipo === "sistema" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterTipo("sistema")}
          >
            Sistema ({notificacoes.filter((n) => n.tipo === "sistema").length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <BellRing className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            Nenhuma notificação encontrada nesta categoria.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="group relative flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:bg-accent/30"
            >
              <div className="mt-0.5">{icon(n.tipo)}</div>
              <div className="min-w-0 flex-1 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`capitalize text-[10px] ${tipoBadge(n.tipo)}`}>
                    {n.tipo}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{n.dataHora}</span>
                </div>
                <p className="text-sm text-foreground leading-snug">{n.mensagem}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(n.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                title="Dispensar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
