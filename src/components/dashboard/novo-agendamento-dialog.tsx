import { useEffect, useState } from "react";
import { AlertCircle, CalendarPlus, CheckCircle2, Clock } from "lucide-react";
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

const TIME_SLOTS = [
  { label: "07:30 — 09:10 (Manhã 1)", inicio: "07:30", fim: "09:10" },
  { label: "09:20 — 11:00 (Manhã 2)", inicio: "09:20", fim: "11:00" },
  { label: "11:10 — 12:50 (Manhã 3)", inicio: "11:10", fim: "12:50" },
  { label: "13:30 — 15:10 (Tarde 1)", inicio: "13:30", fim: "15:10" },
  { label: "15:20 — 17:00 (Tarde 2)", inicio: "15:20", fim: "17:00" },
  { label: "17:10 — 18:50 (Tarde 3)", inicio: "17:10", fim: "18:50" },
  { label: "19:00 — 20:40 (Noite 1)", inicio: "19:00", fim: "20:40" },
  { label: "20:50 — 22:30 (Noite 2)", inicio: "20:50", fim: "22:30" },
];

export function NovoAgendamentoDialog() {
  const {
    salas,
    disciplinas,
    currentUser,
    novoAgendamentoOpen,
    setNovoAgendamentoOpen,
    preselectedSalaCodigo,
    preselectedDisciplinaCodigo,
    addAgendamento,
    checkConflict,
  } = useStore();

  const [data, setData] = useState("2026-09-03");
  const [slotIndex, setSlotIndex] = useState("0");
  const [salaCodigo, setSalaCodigo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinaNome, setDisciplinaNome] = useState("");
  const [disciplinaCodigo, setDisciplinaCodigo] = useState("");
  const [turma, setTurma] = useState("");
  const [professorResponsavel, setProfessorResponsavel] = useState("");
  const [alunos, setAlunos] = useState(30);

  // Sync preselected data when dialog opens
  useEffect(() => {
    if (novoAgendamentoOpen) {
      if (preselectedSalaCodigo) {
        setSalaCodigo(preselectedSalaCodigo);
      } else if (salas.length > 0 && !salaCodigo) {
        setSalaCodigo(salas[0].codigo);
      }

      if (preselectedDisciplinaCodigo) {
        const found = disciplinas.find((d) => d.codigo === preselectedDisciplinaCodigo);
        if (found) {
          setDisciplinaId(found.id);
          setDisciplinaNome(found.nome);
          setDisciplinaCodigo(found.codigo);
          setTurma(found.turma);
          setProfessorResponsavel(found.professor);
          setAlunos(found.alunos);
        }
      } else if (disciplinas.length > 0 && !disciplinaId) {
        const first = disciplinas[0];
        setDisciplinaId(first.id);
        setDisciplinaNome(first.nome);
        setDisciplinaCodigo(first.codigo);
        setTurma(first.turma);
        setProfessorResponsavel(first.professor);
        setAlunos(first.alunos);
      }
    }
  }, [novoAgendamentoOpen, preselectedSalaCodigo, preselectedDisciplinaCodigo, salas, disciplinas]);

  const selectedSlot = TIME_SLOTS[Number(slotIndex)] || TIME_SLOTS[0];
  const selectedSala = salas.find((s) => s.codigo === salaCodigo);

  // Real-time conflict checking
  const conflict = checkConflict(
    data,
    selectedSlot.inicio,
    selectedSlot.fim,
    salaCodigo
  );

  const handleDisciplinaChange = (id: string) => {
    setDisciplinaId(id);
    const disc = disciplinas.find((d) => d.id === id);
    if (disc) {
      setDisciplinaNome(disc.nome);
      setDisciplinaCodigo(disc.codigo);
      setTurma(disc.turma);
      setProfessorResponsavel(disc.professor);
      setAlunos(disc.alunos);
      if (disc.salaPadrao && !preselectedSalaCodigo) {
        setSalaCodigo(disc.salaPadrao);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salaCodigo) {
      toast.error("Selecione uma sala ou laboratório.");
      return;
    }
    if (!disciplinaNome) {
      toast.error("Informe a disciplina.");
      return;
    }

    const salaObj = salas.find((s) => s.codigo === salaCodigo);

    const result = addAgendamento({
      data,
      horaInicio: selectedSlot.inicio,
      horaFim: selectedSlot.fim,
      salaCodigo,
      salaNome: salaObj ? salaObj.nome : salaCodigo,
      salaLocalizacao: salaObj ? salaObj.localizacao : "Campus Principal",
      disciplina: disciplinaNome,
      disciplinaCodigo: disciplinaCodigo || "GER-000",
      turma: turma || "Turma Geral",
      professorResponsavel: professorResponsavel || currentUser.nome,
      solicitanteNome: currentUser.nome,
      solicitantePerfil: currentUser.perfil,
      alunos: Number(alunos) || 30,
    });

    if (result.success) {
      toast.success(result.message);
      setNovoAgendamentoOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={novoAgendamentoOpen} onOpenChange={setNovoAgendamentoOpen}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Novo Agendamento de Sala
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da reserva acadêmica. O sistema verifica conflitos de horário automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {conflict && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Conflito de Horário Detectado!</p>
                <p className="text-xs mt-0.5">
                  A sala <strong>{salaCodigo}</strong> já está agendada para <strong>{conflict.disciplina}</strong>{" "}
                  das {conflict.horaInicio} às {conflict.horaFim} nesta data. Escolha outro horário ou sala.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data da Reserva</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="horario">Horário / Turno</Label>
              <Select value={slotIndex} onValueChange={setSlotIndex}>
                <SelectTrigger id="horario">
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot, idx) => (
                    <SelectItem key={slot.inicio} value={String(idx)}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sala">Sala ou Laboratório</Label>
              <Select value={salaCodigo} onValueChange={setSalaCodigo}>
                <SelectTrigger id="sala">
                  <SelectValue placeholder="Selecione a sala" />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((s) => (
                    <SelectItem key={s.codigo} value={s.codigo}>
                      {s.codigo} — {s.nome} ({s.capacidade} lug. · {s.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSala && (
                <p className="text-xs text-muted-foreground">
                  Capacidade: {selectedSala.capacidade} alunos · {selectedSala.localizacao}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="disciplina-select">Vincular Disciplina Cadastrada</Label>
              <Select value={disciplinaId} onValueChange={handleDisciplinaChange}>
                <SelectTrigger id="disciplina-select">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.codigo} — {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="disciplina">Nome da Disciplina / Atividade</Label>
              <Input
                id="disciplina"
                value={disciplinaNome}
                onChange={(e) => setDisciplinaNome(e.target.value)}
                placeholder="Ex: Banco de Dados II"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="disc-codigo">Código da Disciplina</Label>
              <Input
                id="disc-codigo"
                value={disciplinaCodigo}
                onChange={(e) => setDisciplinaCodigo(e.target.value)}
                placeholder="Ex: BDD-202"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="turma">Turma / Curso</Label>
              <Input
                id="turma"
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                placeholder="Ex: ADS 4º semestre — Noturno"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alunos">Qtd. Alunos</Label>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="professor">Professor Responsável</Label>
              <Input
                id="professor"
                value={professorResponsavel}
                onChange={(e) => setProfessorResponsavel(e.target.value)}
                placeholder="Prof. Nome Completo"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Solicitante</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-foreground">
                <span className="font-medium">{currentUser.nome}</span>
                <span className="ml-2 text-xs text-muted-foreground">({currentUser.perfil})</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNovoAgendamentoOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={Boolean(conflict)}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
