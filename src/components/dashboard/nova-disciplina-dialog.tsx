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

const SEM_SALA = "none";

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
  const [semestre, setSemestre] = useState("");
  const [professor, setProfessor] = useState("");
  const [alunos, setAlunos] = useState("");
  const [salaPadrao, setSalaPadrao] = useState(SEM_SALA);

  useEffect(() => {
    if (disciplinaToEdit) {
      setCodigo(disciplinaToEdit.codigo);
      setNome(disciplinaToEdit.nome);
      setTurma(disciplinaToEdit.turma);
      setTurno(disciplinaToEdit.turno);
      setSemestre(disciplinaToEdit.semestre);
      setProfessor(disciplinaToEdit.professor);
      setAlunos(String(disciplinaToEdit.alunos));
      setSalaPadrao(disciplinaToEdit.salaPadrao || SEM_SALA);
    } else {
      setCodigo("");
      setNome("");
      setTurma("");
      setTurno("Noturno");
      setSemestre("");
      setProfessor("");
      setAlunos("");
      setSalaPadrao(SEM_SALA);
    }
  }, [disciplinaToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !nome.trim() || !turma.trim() || !semestre.trim() || !professor.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const matriculados = Number(alunos);
    if (!Number.isInteger(matriculados) || matriculados < 1) {
      toast.error("Informe a quantidade de alunos matriculados.");
      return;
    }
    // "" remove a sala habitual (o servidor converte em nenhuma sala)
    const sala = salaPadrao === SEM_SALA ? "" : salaPadrao;

    if (disciplinaToEdit) {
      if (!(await updateDisciplina(disciplinaToEdit.id, {
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        turma: turma.trim(),
        turno,
        semestre: semestre.trim(),
        professor: professor.trim(),
        alunos: matriculados,
        salaPadrao: sala,
      }))) return;
      toast.success(`Disciplina ${codigo} atualizada com sucesso!`);
    } else {
      if (!(await addDisciplina({
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        turma: turma.trim(),
        turno,
        semestre: semestre.trim(),
        professor: professor.trim(),
        alunos: matriculados,
        ...(sala ? { salaPadrao: sala } : {}),
      }))) return;
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
              <Select value={turno} onValueChange={(v) => setTurno(v as DisciplinaItem["turno"])}>
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
              placeholder="Ex: Estrutura de Dados"
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
                required
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
                placeholder="Nome do professor"
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
                onChange={(e) => setAlunos(e.target.value)}
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
                <SelectItem value={SEM_SALA}>Nenhuma</SelectItem>
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
