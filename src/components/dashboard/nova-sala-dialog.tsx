import { useState, useEffect } from "react";
import { DoorOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Recurso, Sala, StatusSala } from "@/components/dashboard/data";

interface NovaSalaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salaToEdit?: Sala | null;
}

const COMMON_RESOURCES = [
  "Projetor Full HD",
  "Ar-condicionado",
  "Quadro branco",
  'Smart TV 65"',
  "Computadores para alunos",
  "Sistema de som com microfone",
  "Bancadas com tomadas",
  "Capela de exaustão",
  "Racks e switches",
];

export function NovaSalaDialog({ open, onOpenChange, salaToEdit }: NovaSalaDialogProps) {
  const { addSala, updateSala } = useStore();

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [capacidade, setCapacidade] = useState(40);
  const [status, setStatus] = useState<StatusSala>("disponível");
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [novoRecursoNome, setNovoRecursoNome] = useState("");

  useEffect(() => {
    if (salaToEdit) {
      setCodigo(salaToEdit.codigo);
      setNome(salaToEdit.nome);
      setLocalizacao(salaToEdit.localizacao);
      setCapacidade(salaToEdit.capacidade);
      setStatus(salaToEdit.status);
      setRecursos(salaToEdit.recursos || []);
    } else {
      setCodigo("");
      setNome("");
      setLocalizacao("Bloco A — 1º andar");
      setCapacidade(40);
      setStatus("disponível");
      setRecursos([
        { id: "rc1", nome: "Projetor Full HD", descricao: "HDMI / Wireless" },
        { id: "rc2", nome: "Ar-condicionado", descricao: "Split" },
      ]);
    }
  }, [salaToEdit, open]);

  const addRecursoPreset = (nomeRec: string) => {
    if (recursos.some((r) => r.nome.toLowerCase() === nomeRec.toLowerCase())) return;
    setRecursos((prev) => [
      ...prev,
      { id: `r_${Date.now()}_${Math.random()}`, nome: nomeRec, descricao: nomeRec },
    ]);
  };

  const addRecursoCustom = () => {
    if (!novoRecursoNome.trim()) return;
    setRecursos((prev) => [
      ...prev,
      {
        id: `r_${Date.now()}_${Math.random()}`,
        nome: novoRecursoNome.trim(),
        descricao: novoRecursoNome.trim(),
      },
    ]);
    setNovoRecursoNome("");
  };

  const removeRecurso = (id: string) => {
    setRecursos((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !nome.trim()) {
      toast.error("Preencha o código e o nome da sala.");
      return;
    }

    if (salaToEdit) {
      updateSala(salaToEdit.id, {
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        localizacao: localizacao.trim(),
        capacidade: Number(capacidade) || 30,
        status,
        recursos,
      });
      toast.success(`Sala ${codigo} atualizada com sucesso!`);
    } else {
      addSala({
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        localizacao: localizacao.trim(),
        capacidade: Number(capacidade) || 30,
        status,
        recursos,
      });
      toast.success(`Sala ${codigo} cadastrada com sucesso!`);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <DoorOpen className="h-5 w-5 text-primary" />
            {salaToEdit ? `Editar Sala ${salaToEdit.codigo}` : "Nova Sala ou Laboratório"}
          </DialogTitle>
          <DialogDescription>
            {salaToEdit
              ? "Modifique os dados de capacidade, localização ou recursos deste espaço."
              : "Cadastre um novo ambiente de aula, laboratório ou auditório no sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código Identificador</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: LAB-105 ou SAL-204"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status Operacional</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusSala)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponível">Disponível</SelectItem>
                  <SelectItem value="ocupada">Ocupada</SelectItem>
                  <SelectItem value="manutenção">Em Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome Completo do Espaço</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Laboratório de Robótica e Automação"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="localizacao">Localização / Bloco / Andar</Label>
              <Input
                id="localizacao"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Ex: Bloco B — 2º andar"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacidade">Capacidade (Lugares)</Label>
              <Input
                id="capacidade"
                type="number"
                min={1}
                max={500}
                value={capacidade}
                onChange={(e) => setCapacidade(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recursos e Equipamentos</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_RESOURCES.map((rec) => {
                const selected = recursos.some((r) => r.nome === rec);
                return (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => (selected ? removeRecurso(recursos.find((r) => r.nome === rec)!.id) : addRecursoPreset(rec))}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {rec}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Outro recurso específico..."
                value={novoRecursoNome}
                onChange={(e) => setNovoRecursoNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecursoCustom();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRecursoCustom}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>

            {recursos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recursos.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {r.nome}
                    <button
                      type="button"
                      onClick={() => removeRecurso(r.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {salaToEdit ? "Salvar Alterações" : "Cadastrar Sala"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
