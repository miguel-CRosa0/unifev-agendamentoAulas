import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useStore, type DisciplinaItem } from "@/context/store-context";
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

interface NovaDisciplinaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disciplinaToEdit?: DisciplinaItem | null;
}

export function NovaDisciplinaDialog({
  open,
  onOpenChange,
  disciplinaToEdit,
}: NovaDisciplinaDialogProps) {
  const { addDisciplina, updateDisciplina, salas } = useStore();

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [turno, setTurno] = useState<"Matutino" | "Vespertino" | "Noturno" | "Integral">("Noturno");
  const [semestre, setSemestre] = useState("1º Semestre");
  const [professor, setProfessor] = useState("");
  const [alunos, setAlunos] = useState(35);
  const [salaPadrao, setSalaPadrao] = useState("");

  useEffect(() => {
    if (disciplinaToEdit) {
      setCodigo(disciplinaToEdit.codigo);
      setNome(disciplinaToEdit.nome);
      setTurma(disciplinaToEdit.turma);
      setTurno(disciplinaToEdit.turno);
      setSemestre(disciplinaToEdit.semestre);
      setProfessor(disciplinaToEdit.professor);
      setAlunos(disciplinaToEdit.alunos);
      setSalaPadrao(disciplinaToEdit.salaPadrao || "");
    } else {
      setCodigo("");
      setNome("");
      setTurma("");
      setTurno("Noturno");
      setSemestre("1º Semestre");
      setProfessor("");
      setAlunos(35);
      setSalaPadrao(salas[0]?.codigo || "");
    }
  }, [disciplinaToEdit, open, salas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !nome.trim() || !turma.trim() || !professor.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (disciplinaToEdit) {
      updateDisciplina(disciplinaToEdit.id, {
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        turma: turma.trim(),
        turno,
        semestre,
        professor: professor.trim(),
        alunos: Number(alunos) || 30,
        salaPadrao: salaPadrao || undefined,
      });
      toast.success(`Disciplina ${codigo} atualizada com sucesso!`);
    } else {
      addDisciplina({
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        turma: turma.trim(),
        turno,
        semestre,
        professor: professor.trim(),
        alunos: Number(alunos) || 30,
        salaPadrao: salaPadrao || undefined,
      });
      toast.success(`Disciplina ${codigo} adicionada com sucesso!`);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            {disciplinaToEdit ? "Editar Disciplina" : "Nova Disciplina e Turma"}
          </DialogTitle>
          <DialogDescription>
            Cadastre disciplinas acadêmicas e vincule a turmas e professores responsáveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="disc-code">Código da Disciplina</Label>
              <Input
                id="disc-code"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: POO-204"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={(v) => setTurno(v as any)}>
                <SelectTrigger id="turno">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matutino">Matutino</SelectItem>
                  <SelectItem value="Vespertino">Vespertino</SelectItem>
                  <SelectItem value="Noturno">Noturno</SelectItem>
                  <SelectItem value="Integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disc-nome">Nome da Disciplina</Label>
            <Input
              id="disc-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Estruturas de Dados Avançadas"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="turma">Turma / Descrição</Label>
              <Input
                id="turma"
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                placeholder="Ex: ADS 3º semestre — Noturno"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semestre">Período / Semestre</Label>
              <Input
                id="semestre"
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                placeholder="Ex: 3º Semestre"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prof">Professor Responsável</Label>
              <Input
                id="prof"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                placeholder="Ex: Prof.ª Ana Souza"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alunos">Qtd. de Alunos Matriculados</Label>
              <Input
                id="alunos"
                type="number"
                min={1}
                max={300}
                value={alunos}
                onChange={(e) => setAlunos(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sala-padrao">Sala Habitual / Preferencial (Opcional)</Label>
            <Select value={salaPadrao} onValueChange={setSalaPadrao}>
              <SelectTrigger id="sala-padrao">
                <SelectValue placeholder="Selecione a sala padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma selecionada</SelectItem>
                {salas.map((s) => (
                  <SelectItem key={s.codigo} value={s.codigo}>
                    {s.codigo} — {s.nome} ({s.capacidade} lug.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {disciplinaToEdit ? "Salvar Alterações" : "Cadastrar Disciplina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
