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

export const configuracoesPadrao: Configuracoes = {
  antecedenciaMinima: 24,
  duracaoMaxima: 100,
  bloquearConflitos: true,
  aprovacaoCoordenador: true,
  senhaTemporariaNascimento: true,
  trocaObrigatoriaPrimeiroLogin: true,
  tamanhoMinimoSenha: 8,
};
