// Modelo alinhado ao Diagrama de Classes:
// Usuário (Administrador, Coordenador/Professor, Professor, Aluno),
// Sala + Recurso, Agendamento, Disciplina, Turma, Notificação, Relatório.

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

export const indicadores: Indicador[] = [
  { label: "Salas e laboratórios", value: "12", change: "+2 cadastrados no mês", trend: "up" },
  { label: "Agendamentos de hoje", value: "08", change: "+3 vs. ontem", trend: "up" },
  { label: "Conflitos de horário", value: "01", change: "aguardando ajuste", trend: "down" },
  { label: "Taxa de ocupação", value: "67%", change: "+5% nesta semana", trend: "up" },
];

const r = (id: string, nome: string, descricao: string): Recurso => ({ id, nome, descricao });

export const salas: Sala[] = [
  {
    id: "s1",
    codigo: "LAB-101",
    nome: "Laboratório de Informática I",
    localizacao: "Bloco A — 1º andar",
    capacidade: 40,
    recursos: [
      r("rc1", "Projetor", "Full HD com HDMI"),
      r("rc2", "40 computadores", "Core i5 / 16GB"),
      r("rc3", "Ar-condicionado", "Split 24.000 BTUs"),
    ],
    status: "ocupada",
  },
  {
    id: "s2",
    codigo: "LAB-102",
    nome: "Laboratório de Redes",
    localizacao: "Bloco A — 1º andar",
    capacidade: 24,
    recursos: [
      r("rc4", "Racks e switches", "Bancada de práticas Cisco"),
      r("rc5", "Projetor", "Full HD"),
      r("rc6", "Quadro branco", "3m"),
    ],
    status: "disponível",
  },
  {
    id: "s3",
    codigo: "SAL-201",
    nome: "Sala de Aula 201",
    localizacao: "Bloco B — 2º andar",
    capacidade: 50,
    recursos: [r("rc7", "Projetor", "HDMI"), r("rc8", "Ar-condicionado", "Split")],
    status: "disponível",
  },
  {
    id: "s4",
    codigo: "LAB-203",
    nome: "Laboratório de Química",
    localizacao: "Bloco C — 2º andar",
    capacidade: 30,
    recursos: [
      r("rc9", "Capela de exaustão", "Uso obrigatório com EPI"),
      r("rc10", "Bancadas", "10 bancadas duplas"),
    ],
    status: "manutenção",
  },
  {
    id: "s5",
    codigo: "AUD-001",
    nome: "Auditório Central",
    localizacao: "Bloco D — Térreo",
    capacidade: 120,
    recursos: [
      r("rc11", "Sistema de som", "Mesa + 2 microfones"),
      r("rc12", "Projetor", "Tela 200 polegadas"),
      r("rc13", "Transmissão", "Câmera para live"),
    ],
    status: "ocupada",
  },
  {
    id: "s6",
    codigo: "SAL-305",
    nome: "Sala de Aula 305",
    localizacao: "Bloco B — 3º andar",
    capacidade: 45,
    recursos: [r("rc14", "TV 65\"", "Espelhamento sem fio"), r("rc15", "Quadro branco", "4m")],
    status: "disponível",
  },
];

export const agendamentos: Agendamento[] = [
  {
    id: "a1",
    data: "2026-09-03",
    horaInicio: "07:30",
    horaFim: "09:10",
    status: "confirmado",
    salaCodigo: "LAB-101",
    salaNome: "Laboratório de Informática I",
    salaLocalizacao: "Bloco A — 1º andar",
    disciplina: "Programação Orientada a Objetos",
    disciplinaCodigo: "POO-204",
    turma: "ADS 3º semestre — Noturno",
    professorResponsavel: "Prof. Ana Souza",
    solicitanteNome: "Ana Souza",
    solicitantePerfil: "Professor",
    alunos: 38,
  },
  {
    id: "a2",
    data: "2026-09-03",
    horaInicio: "09:20",
    horaFim: "11:00",
    status: "confirmado",
    salaCodigo: "LAB-102",
    salaNome: "Laboratório de Redes",
    salaLocalizacao: "Bloco A — 1º andar",
    disciplina: "Redes de Computadores",
    disciplinaCodigo: "RED-118",
    turma: "Redes 2º semestre — Matutino",
    professorResponsavel: "Prof. Bruno Lima",
    solicitanteNome: "Carla Mendes",
    solicitantePerfil: "Coordenador",
    alunos: 22,
  },
  {
    id: "a3",
    data: "2026-09-03",
    horaInicio: "13:30",
    horaFim: "15:10",
    status: "pendente",
    salaCodigo: "AUD-001",
    salaNome: "Auditório Central",
    salaLocalizacao: "Bloco D — Térreo",
    disciplina: "Seminário de Integração",
    disciplinaCodigo: "SEM-010",
    turma: "Todos os cursos",
    professorResponsavel: "Prof.ª Carla Mendes",
    solicitanteNome: "Carla Mendes",
    solicitantePerfil: "Coordenador",
    alunos: 110,
  },
  {
    id: "a4",
    data: "2026-09-03",
    horaInicio: "15:20",
    horaFim: "17:00",
    status: "confirmado",
    salaCodigo: "SAL-201",
    salaNome: "Sala de Aula 201",
    salaLocalizacao: "Bloco B — 2º andar",
    disciplina: "Banco de Dados",
    disciplinaCodigo: "BDD-142",
    turma: "ADS 4º semestre — Vespertino",
    professorResponsavel: "Prof. Diego Rocha",
    solicitanteNome: "Diego Rocha",
    solicitantePerfil: "Professor",
    alunos: 41,
  },
  {
    id: "a5",
    data: "2026-09-03",
    horaInicio: "17:10",
    horaFim: "18:50",
    status: "cancelado",
    salaCodigo: "LAB-203",
    salaNome: "Laboratório de Química",
    salaLocalizacao: "Bloco C — 2º andar",
    disciplina: "Química Aplicada",
    disciplinaCodigo: "QUI-060",
    turma: "Engenharia 1º semestre",
    professorResponsavel: "Prof.ª Fernanda Costa",
    solicitanteNome: "Fernanda Costa",
    solicitantePerfil: "Professor",
    alunos: 28,
  },
  {
    id: "a6",
    data: "2026-09-03",
    horaInicio: "19:00",
    horaFim: "20:40",
    status: "pendente",
    salaCodigo: "SAL-305",
    salaNome: "Sala de Aula 305",
    salaLocalizacao: "Bloco B — 3º andar",
    disciplina: "Engenharia de Software",
    disciplinaCodigo: "ESW-231",
    turma: "ADS 5º semestre — Noturno",
    professorResponsavel: "Prof. Gabriel Teixeira",
    solicitanteNome: "Gabriel Teixeira",
    solicitantePerfil: "Professor",
    alunos: 35,
  },
];

export const usuarios: Usuario[] = [
  {
    id: "u1",
    nome: "Marcos Andrade",
    email: "marcos.andrade@instituicao.edu.br",
    perfil: "Administrador",
    nivelAcesso: ["Gerenciar salas", "Gerenciar usuários", "Definir nível de acesso", "Gerar relatório"],
  },
  {
    id: "u2",
    nome: "Carla Mendes",
    email: "carla.mendes@instituicao.edu.br",
    perfil: "Coordenador",
    tambemProfessor: true,
    nivelAcesso: ["Realizar agendamento", "Editar agendamento", "Ministrar disciplinas"],
  },
  {
    id: "u3",
    nome: "Ana Souza",
    email: "ana.souza@instituicao.edu.br",
    perfil: "Professor",
    nivelAcesso: ["Realizar agendamento", "Editar agendamento"],
  },
  {
    id: "u4",
    nome: "Gabriel Teixeira",
    email: "gabriel.teixeira@instituicao.edu.br",
    perfil: "Professor",
    nivelAcesso: ["Realizar agendamento", "Editar agendamento", "Ministrar disciplinas"],
  },
];

export const notificacoes: Notificacao[] = [
  {
    id: "n1",
    mensagem: "Conflito de horário detectado no LAB-101 para 04/09 às 07:30.",
    dataHora: "03/09/2026 08:12",
    tipo: "conflito",
  },
  {
    id: "n2",
    mensagem: "Agendamento do Auditório Central aguarda confirmação da coordenação.",
    dataHora: "03/09/2026 07:55",
    tipo: "confirmacao",
  },
  {
    id: "n3",
    mensagem: "Química Aplicada cancelada — LAB-203 em manutenção.",
    dataHora: "02/09/2026 18:40",
    tipo: "cancelamento",
  },
  {
    id: "n4",
    mensagem: "Relatório de uso das salas (01/08 a 31/08) disponível para download.",
    dataHora: "01/09/2026 09:00",
    tipo: "sistema",
  },
];

export const relatorio = {
  periodoInicio: "01/08/2026",
  periodoFim: "31/08/2026",
  totalHoras: 486,
  taxaOcupacao: 67,
};

export const agendaDoDia = [
  { time: "07:30", itens: ["POO — LAB-101 · Prof. Ana Souza"] },
  { time: "09:20", itens: ["Redes de Computadores — LAB-102 · Prof. Bruno Lima"] },
  { time: "11:00", itens: [] },
  { time: "13:30", itens: ["Seminário de Integração — AUD-001 · Prof.ª Carla Mendes"] },
  { time: "15:20", itens: ["Banco de Dados — SAL-201 · Prof. Diego Rocha"] },
  { time: "17:10", itens: [] },
  { time: "19:00", itens: ["Engenharia de Software — SAL-305 · Prof. Gabriel Teixeira"] },
];
