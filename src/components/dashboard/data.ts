// Tipos do domínio, alinhados ao Diagrama de Classes:
// Usuário (Administrador, Coordenador/Professor, Professor), Sala + Recurso,
// Agendamento, Disciplina, Notificação e Configurações.

export type Perfil = "Administrador" | "Coordenador" | "Professor";
export type StatusAgendamento = "confirmado" | "pendente" | "cancelado";
export type StatusSala = "disponível" | "ocupada" | "manutenção";

export interface Recurso {
  id: string;
  nome: string;
  descricao: string;
}

export interface Sala {
  id: string;
  codigo: string;
  nome: string;
  localizacao: string;
  capacidade: number;
  recursos: Recurso[];
  status: StatusSala;
}

export interface Agendamento {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: StatusAgendamento;
  salaCodigo: string;
  salaNome: string;
  salaLocalizacao: string;
  disciplina: string;
  disciplinaCodigo: string;
  turma: string;
  professorResponsavel: string;
  solicitanteId: string | null;
  solicitanteNome: string;
  solicitantePerfil: Perfil;
  alunos: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  // Um Coordenador também é Professor (herança do ator Usuário no diagrama).
  tambemProfessor?: boolean;
  nivelAcesso: string[];
  ra?: string;
  telefone?: string;
}

export interface Notificacao {
  id: string;
  mensagem: string;
  dataHora: string;
  tipo: "conflito" | "confirmacao" | "cancelamento" | "sistema";
}

export interface Indicador {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface DisciplinaItem {
  id: string;
  codigo: string;
  nome: string;
  turma: string;
  turno: "Matutino" | "Vespertino" | "Noturno" | "Integral";
  semestre: string;
  professor: string;
  alunos: number;
  salaPadrao?: string;
}

export interface Configuracoes {
  antecedenciaMinima: number;
  duracaoMaxima: number;
  bloquearConflitos: boolean;
  aprovacaoCoordenador: boolean;
  senhaTemporariaNascimento: boolean;
  trocaObrigatoriaPrimeiroLogin: boolean;
  tamanhoMinimoSenha: number;
}

// Horários de aula oferecidos no agendamento (blocos de 100 minutos)
export const HORARIOS_AULA = [
  { label: "07:30 — 09:10 (Manhã 1)", inicio: "07:30", fim: "09:10" },
  { label: "09:20 — 11:00 (Manhã 2)", inicio: "09:20", fim: "11:00" },
  { label: "11:10 — 12:50 (Manhã 3)", inicio: "11:10", fim: "12:50" },
  { label: "13:30 — 15:10 (Tarde 1)", inicio: "13:30", fim: "15:10" },
  { label: "15:20 — 17:00 (Tarde 2)", inicio: "15:20", fim: "17:00" },
  { label: "17:10 — 18:50 (Tarde 3)", inicio: "17:10", fim: "18:50" },
  { label: "19:00 — 20:40 (Noite 1)", inicio: "19:00", fim: "20:40" },
  { label: "20:50 — 22:30 (Noite 2)", inicio: "20:50", fim: "22:30" },
];

export function minutosDoDia(hhmm: string) {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
}

export const configuracoesPadrao: Configuracoes = {
  antecedenciaMinima: 24,
  duracaoMaxima: 100,
  bloquearConflitos: true,
  aprovacaoCoordenador: true,
  senhaTemporariaNascimento: true,
  trocaObrigatoriaPrimeiroLogin: true,
  tamanhoMinimoSenha: 8,
};

// O que cada perfil pode fazer. Reflete as verificações feitas no servidor (src/lib/api.ts).
export const PERMISSOES_POR_PERFIL: Record<Perfil, string[]> = {
  Administrador: [
    "Gerenciar salas",
    "Gerenciar usuários",
    "Configurar o sistema",
    "Gerenciar disciplinas",
    "Aprovar agendamentos",
    "Agendar sem aprovação",
    "Gerar relatórios",
  ],
  Coordenador: [
    "Gerenciar disciplinas",
    "Alterar status de salas",
    "Aprovar agendamentos",
    "Agendar sem aprovação",
    "Gerar relatórios",
  ],
  Professor: ["Solicitar agendamentos", "Cancelar os próprios agendamentos", "Gerar relatórios"],
};
