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
import { HORARIOS_AULA, minutosDoDia } from "@/components/dashboard/data";

const TIME_SLOTS = HORARIOS_AULA;

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
    configuracoes,
  } = useStore();

  // Padrão: amanhã (hoje normalmente fica dentro da antecedência mínima)
  const [data, setData] = useState(() =>
    new Date(Date.now() + 86_400_000).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }),
  );
  const [slotIndex, setSlotIndex] = useState("0");
  const [salaCodigo, setSalaCodigo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinaNome, setDisciplinaNome] = useState("");
  const [disciplinaCodigo, setDisciplinaCodigo] = useState("");
  const [turma, setTurma] = useState("");
  const [professorResponsavel, setProfessorResponsavel] = useState("");
  const [alunos, setAlunos] = useState("");

  // Sync preselected data when dialog opens
  useEffect(() => {
    if (novoAgendamentoOpen) {
      if (preselectedSalaCodigo) {
        setSalaCodigo(preselectedSalaCodigo);
      } else if (salas.length > 0 && !salaCodigo) {
        const firstSala = salas[0];
        if (firstSala) setSalaCodigo(firstSala.codigo);
      }

      if (preselectedDisciplinaCodigo) {
        const found = disciplinas.find((d) => d.codigo === preselectedDisciplinaCodigo);
        if (found) {
          setDisciplinaId(found.id);
          setDisciplinaNome(found.nome);
          setDisciplinaCodigo(found.codigo);
          setTurma(found.turma);
          setProfessorResponsavel(found.professor);
          setAlunos(String(found.alunos));
          if (found.salaPadrao && !preselectedSalaCodigo) setSalaCodigo(found.salaPadrao);
        }
      }
    }
  }, [novoAgendamentoOpen, preselectedSalaCodigo, preselectedDisciplinaCodigo, salas, disciplinas]);

  const selectedSlot = TIME_SLOTS[Number(slotIndex)] ?? TIME_SLOTS[0]!;
  const selectedSala = salas.find((s) => s.codigo === salaCodigo);

  // Real-time conflict checking
  const conflict = checkConflict(
    data,
    selectedSlot.inicio,
    selectedSlot.fim,
    salaCodigo
  );

  // Mesmas regras validadas no servidor, mostradas antes de enviar
  const horasAteInicio =
    (new Date(`${data}T${selectedSlot.inicio}:00-03:00`).getTime() - Date.now()) / 3_600_000;
  const duracaoSlot = minutosDoDia(selectedSlot.fim) - minutosDoDia(selectedSlot.inicio);
  const qtdAlunos = Number(alunos);
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const aviso =
    selectedSala && qtdAlunos > selectedSala.capacidade
      ? `A sala ${selectedSala.codigo} comporta ${selectedSala.capacidade} alunos (informado: ${qtdAlunos}).`
      : horasAteInicio < 0
        ? "Este horário já passou. Escolha outra data ou horário."
        : horasAteInicio < configuracoes.antecedenciaMinima
          ? `Os agendamentos precisam ser feitos com ao menos ${configuracoes.antecedenciaMinima}h de antecedência.`
          : duracaoSlot > configuracoes.duracaoMaxima
            ? `A duração máxima por reserva é de ${configuracoes.duracaoMaxima} minutos (este horário tem ${duracaoSlot}).`
            : null;

  const handleDisciplinaChange = (id: string) => {
    setDisciplinaId(id);
    const disc = disciplinas.find((d) => d.id === id);
    if (disc) {
      setDisciplinaNome(disc.nome);
      setDisciplinaCodigo(disc.codigo);
      setTurma(disc.turma);
      setProfessorResponsavel(disc.professor);
      setAlunos(String(disc.alunos));
      if (disc.salaPadrao && !preselectedSalaCodigo) {
        setSalaCodigo(disc.salaPadrao);
      }
    }
  };

  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!salaCodigo) {
      toast.error("Selecione uma sala ou laboratório.");
      return;
    }
    if (!disciplinaNome.trim() || !disciplinaCodigo.trim() || !turma.trim() || !professorResponsavel.trim()) {
      toast.error("Preencha a disciplina, o código, a turma e o professor responsável.");
      return;
    }
    if (!Number.isInteger(qtdAlunos) || qtdAlunos < 1) {
      toast.error("Informe a quantidade de alunos.");
      return;
    }

    setSalvando(true);
    const result = await addAgendamento({
      data,
      horaInicio: selectedSlot.inicio,
      horaFim: selectedSlot.fim,
      salaCodigo,
      disciplina: disciplinaNome.trim(),
      disciplinaCodigo: disciplinaCodigo.trim().toUpperCase(),
      turma: turma.trim(),
      professorResponsavel: professorResponsavel.trim(),
      alunos: qtdAlunos,
    });
    setSalvando(false);

    if (result.success) {
      toast.success(result.message);
      setNovoAgendamentoOpen(false);
      setDisciplinaId("");
      setDisciplinaNome("");
      setDisciplinaCodigo("");
      setTurma("");
      setProfessorResponsavel("");
      setAlunos("");
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

        {salas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma sala cadastrada ainda. O administrador precisa cadastrar as salas e laboratórios
            antes de os agendamentos serem feitos.
          </div>
        ) : (
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

          {!conflict && aviso && (
            <div className="flex items-start gap-3 rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-sm text-slate-700 dark:text-slate-400">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-xs mt-0.5">{aviso}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data da Reserva</Label>
              <Input
                id="data"
                type="date"
                min={hoje}
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
              <Select value={disciplinaId} onValueChange={handleDisciplinaChange} disabled={disciplinas.length === 0}>
                <SelectTrigger id="disciplina-select">
                  <SelectValue
                    placeholder={disciplinas.length === 0 ? "Nenhuma disciplina cadastrada" : "Selecione uma disciplina"}
                  />
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
                placeholder="Nome da disciplina ou atividade"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="disc-codigo">Código da Disciplina</Label>
              <Input
                id="disc-codigo"
                value={disciplinaCodigo}
                onChange={(e) => setDisciplinaCodigo(e.target.value)}
                placeholder="Código da disciplina"
                required
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
                placeholder="Curso, semestre e turno"
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
                onChange={(e) => setAlunos(e.target.value)}
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
                placeholder="Nome do professor"
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
            <Button type="submit" disabled={Boolean(conflict) || Boolean(aviso) || salvando}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
