import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  type Agendamento,
  type Indicador,
  type Notificacao,
  type Perfil,
  type Sala,
  type StatusAgendamento,
  type StatusSala,
  type Usuario,
  agendamentos as initialAgendamentos,
  indicadores as initialIndicadores,
  notificacoes as initialNotificacoes,
  salas as initialSalas,
  usuarios as initialUsuarios,
} from "@/components/dashboard/data";

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

export const initialDisciplinas: DisciplinaItem[] = [
  {
    id: "d1",
    codigo: "POO-204",
    nome: "Programação Orientada a Objetos",
    turma: "ADS 3º semestre — Noturno",
    turno: "Noturno",
    semestre: "3º Semestre",
    professor: "Prof. Ana Souza",
    alunos: 38,
    salaPadrao: "LAB-101",
  },
  {
    id: "d2",
    codigo: "RED-118",
    nome: "Redes de Computadores",
    turma: "Redes 2º semestre — Matutino",
    turno: "Matutino",
    semestre: "2º Semestre",
    professor: "Prof. Bruno Lima",
    alunos: 22,
    salaPadrao: "LAB-102",
  },
  {
    id: "d3",
    codigo: "SEM-010",
    nome: "Seminário de Integração",
    turma: "Todos os cursos",
    turno: "Vespertino",
    semestre: "Multidisciplinar",
    professor: "Prof.ª Carla Mendes",
    alunos: 110,
    salaPadrao: "AUD-001",
  },
  {
    id: "d4",
    codigo: "BDD-142",
    nome: "Banco de Dados",
    turma: "ADS 4º semestre — Vespertino",
    turno: "Vespertino",
    semestre: "4º Semestre",
    professor: "Prof. Diego Rocha",
    alunos: 41,
    salaPadrao: "SAL-201",
  },
  {
    id: "d5",
    codigo: "QUI-060",
    nome: "Química Aplicada",
    turma: "Engenharia 1º semestre — Matutino",
    turno: "Matutino",
    semestre: "1º Semestre",
    professor: "Prof.ª Fernanda Costa",
    alunos: 28,
    salaPadrao: "LAB-203",
  },
  {
    id: "d6",
    codigo: "ESW-231",
    nome: "Engenharia de Software",
    turma: "ADS 5º semestre — Noturno",
    turno: "Noturno",
    semestre: "5º Semestre",
    professor: "Prof. Gabriel Teixeira",
    alunos: 35,
    salaPadrao: "SAL-305",
  },
  {
    id: "d7",
    codigo: "CAL-101",
    nome: "Cálculo Diferencial e Integral I",
    turma: "Engenharia 1º semestre — Matutino",
    turno: "Matutino",
    semestre: "1º Semestre",
    professor: "Prof. Marcos Andrade",
    alunos: 45,
    salaPadrao: "SAL-201",
  },
  {
    id: "d8",
    codigo: "IA-402",
    nome: "Inteligência Artificial e Aprendizado",
    turma: "Ciência da Computação 6º sem",
    turno: "Noturno",
    semestre: "6º Semestre",
    professor: "Prof.ª Ana Souza",
    alunos: 32,
    salaPadrao: "LAB-101",
  },
];

export interface Configuracoes {
  antecedenciaMinima: number;
  duracaoMaxima: number;
  bloquearConflitos: boolean;
  aprovacaoCoordenador: boolean;
  senhaTemporariaNascimento: boolean;
  trocaObrigatoriaPrimeiroLogin: boolean;
  tamanhoMinimoSenha: number;
}

const initialConfiguracoes: Configuracoes = {
  antecedenciaMinima: 24,
  duracaoMaxima: 100,
  bloquearConflitos: true,
  aprovacaoCoordenador: true,
  senhaTemporariaNascimento: true,
  trocaObrigatoriaPrimeiroLogin: true,
  tamanhoMinimoSenha: 8,
};

interface StoreContextType {
  // Salas
  salas: Sala[];
  addSala: (nova: Omit<Sala, "id">) => Sala;
  updateSala: (id: string, updates: Partial<Sala>) => void;
  deleteSala: (id: string) => void;
  setSalaStatus: (id: string, status: StatusSala) => void;

  // Agendamentos
  agendamentos: Agendamento[];
  addAgendamento: (
    novo: Omit<Agendamento, "id" | "status"> & { status?: StatusAgendamento }
  ) => { success: boolean; message: string; agendamento?: Agendamento };
  updateAgendamentoStatus: (id: string, status: StatusAgendamento) => void;
  deleteAgendamento: (id: string) => void;
  checkConflict: (
    data: string,
    horaInicio: string,
    horaFim: string,
    salaCodigo: string,
    excludeId?: string
  ) => Agendamento | null;

  // Disciplinas
  disciplinas: DisciplinaItem[];
  addDisciplina: (disc: Omit<DisciplinaItem, "id">) => DisciplinaItem;
  updateDisciplina: (id: string, updates: Partial<DisciplinaItem>) => void;
  deleteDisciplina: (id: string) => void;

  // Usuários
  usuarios: Usuario[];
  addUsuario: (user: Omit<Usuario, "id">) => Usuario;
  updateUsuario: (id: string, updates: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;

  // Notificações
  notificacoes: Notificacao[];
  unreadNotificacoesCount: number;
  addNotificacao: (notif: Omit<Notificacao, "id">) => void;
  deleteNotificacao: (id: string) => void;
  clearAllNotificacoes: () => void;

  // Configurações
  configuracoes: Configuracoes;
  updateConfiguracoes: (updates: Partial<Configuracoes>) => void;

  // Current User / Session
  currentUser: Usuario;
  switchUser: (id: string) => void;

  // Computed Indicators
  indicadores: Indicador[];

  // Global Dialog State
  novoAgendamentoOpen: boolean;
  setNovoAgendamentoOpen: (open: boolean) => void;
  preselectedSalaCodigo?: string;
  preselectedDisciplinaCodigo?: string;
  openNovoAgendamento: (salaCodigo?: string, disciplinaCodigo?: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  SALAS: "salafacil_salas_v1",
  AGENDAMENTOS: "salafacil_agendamentos_v1",
  DISCIPLINAS: "salafacil_disciplinas_v1",
  USUARIOS: "salafacil_usuarios_v1",
  NOTIFICACOES: "salafacil_notificacoes_v1",
  CONFIG: "salafacil_config_v1",
  CURRENT_USER_ID: "salafacil_current_user_id_v1",
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [salas, setSalas] = useState<Sala[]>(initialSalas);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(initialAgendamentos);
  const [disciplinas, setDisciplinas] = useState<DisciplinaItem[]>(initialDisciplinas);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(initialNotificacoes);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>(initialConfiguracoes);
  const [currentUserId, setCurrentUserId] = useState<string>("u1");

  // Modal control
  const [novoAgendamentoOpen, setNovoAgendamentoOpen] = useState(false);
  const [preselectedSalaCodigo, setPreselectedSalaCodigo] = useState<string | undefined>();
  const [preselectedDisciplinaCodigo, setPreselectedDisciplinaCodigo] = useState<string | undefined>();

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const storedSalas = localStorage.getItem(STORAGE_KEYS.SALAS);
      if (storedSalas) setSalas(JSON.parse(storedSalas));

      const storedAgendamentos = localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS);
      if (storedAgendamentos) setAgendamentos(JSON.parse(storedAgendamentos));

      const storedDisciplinas = localStorage.getItem(STORAGE_KEYS.DISCIPLINAS);
      if (storedDisciplinas) setDisciplinas(JSON.parse(storedDisciplinas));

      const storedUsuarios = localStorage.getItem(STORAGE_KEYS.USUARIOS);
      if (storedUsuarios) setUsuarios(JSON.parse(storedUsuarios));

      const storedNotificacoes = localStorage.getItem(STORAGE_KEYS.NOTIFICACOES);
      if (storedNotificacoes) setNotificacoes(JSON.parse(storedNotificacoes));

      const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (storedConfig) setConfiguracoes(JSON.parse(storedConfig));

      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (storedUserId) setCurrentUserId(storedUserId);
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALAS, JSON.stringify(salas));
    } catch {}
  }, [salas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(agendamentos));
    } catch {}
  }, [agendamentos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCIPLINAS, JSON.stringify(disciplinas));
    } catch {}
  }, [disciplinas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
    } catch {}
  }, [usuarios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
    } catch {}
  }, [notificacoes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configuracoes));
    } catch {}
  }, [configuracoes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch {}
  }, [currentUserId]);

  const currentUser = useMemo(() => {
    return usuarios.find((u) => u.id === currentUserId) || usuarios[0] || initialUsuarios[0];
  }, [usuarios, currentUserId]);

  const unreadNotificacoesCount = notificacoes.length;

  // Conflict detection helper
  const checkConflict = (
    data: string,
    horaInicio: string,
    horaFim: string,
    salaCodigo: string,
    excludeId?: string
  ): Agendamento | null => {
    return (
      agendamentos.find((a) => {
        if (excludeId && a.id === excludeId) return false;
        if (a.status === "cancelado") return false;
        if (a.data !== data || a.salaCodigo !== salaCodigo) return false;

        // Check time overlap: (StartA < EndB) and (EndA > StartB)
        return a.horaInicio < horaFim && a.horaFim > horaInicio;
      }) || null
    );
  };

  // Add Sala
  const addSala = (nova: Omit<Sala, "id">): Sala => {
    const sala: Sala = {
      ...nova,
      id: `s_${Date.now()}`,
    };
    setSalas((prev) => [sala, ...prev]);
    addNotificacao({
      mensagem: `Nova sala cadastrada: ${sala.codigo} — ${sala.nome}`,
      dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      tipo: "sistema",
    });
    return sala;
  };

  // Update Sala
  const updateSala = (id: string, updates: Partial<Sala>) => {
    setSalas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Delete Sala
  const deleteSala = (id: string) => {
    setSalas((prev) => prev.filter((s) => s.id !== id));
  };

  // Set Sala Status
  const setSalaStatus = (id: string, status: StatusSala) => {
    setSalas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Add Agendamento
  const addAgendamento = (
    novo: Omit<Agendamento, "id" | "status"> & { status?: StatusAgendamento }
  ): { success: boolean; message: string; agendamento?: Agendamento } => {
    // Check conflicts
    const conflict = checkConflict(
      novo.data,
      novo.horaInicio,
      novo.horaFim,
      novo.salaCodigo
    );

    if (conflict && configuracoes.bloquearConflitos) {
      addNotificacao({
        mensagem: `Conflito de horário bloqueado na sala ${novo.salaCodigo} para o dia ${novo.data.split("-").reverse().join("/")} às ${novo.horaInicio}.`,
        dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        tipo: "conflito",
      });
      return {
        success: false,
        message: `Conflito de horário: a sala ${novo.salaCodigo} já está reservada das ${conflict.horaInicio} às ${conflict.horaFim} (${conflict.disciplina}).`,
      };
    }

    let finalStatus: StatusAgendamento = novo.status || "confirmado";
    if (
      novo.solicitantePerfil === "Professor" &&
      configuracoes.aprovacaoCoordenador
    ) {
      finalStatus = "pendente";
    }

    const agendamento: Agendamento = {
      ...novo,
      id: `a_${Date.now()}`,
      status: finalStatus,
    };

    setAgendamentos((prev) => [agendamento, ...prev]);

    // Update room status to ocupada if it's today
    const hoje = new Date().toISOString().slice(0, 10);
    if (agendamento.data === hoje && finalStatus === "confirmado") {
      setSalas((prev) =>
        prev.map((s) =>
          s.codigo === agendamento.salaCodigo ? { ...s, status: "ocupada" } : s
        )
      );
    }

    addNotificacao({
      mensagem:
        finalStatus === "pendente"
          ? `Novo agendamento pendente de aprovação: ${agendamento.disciplina} na sala ${agendamento.salaCodigo}.`
          : `Agendamento confirmado: ${agendamento.disciplina} na sala ${agendamento.salaCodigo} dia ${agendamento.data.split("-").reverse().join("/")}.`,
      dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      tipo: finalStatus === "pendente" ? "sistema" : "confirmacao",
    });

    return {
      success: true,
      message:
        finalStatus === "pendente"
          ? "Agendamento solicitado com sucesso! Aguardando aprovação da coordenação."
          : "Agendamento confirmado com sucesso!",
      agendamento,
    };
  };

  // Update Agendamento Status
  const updateAgendamentoStatus = (id: string, status: StatusAgendamento) => {
    setAgendamentos((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          addNotificacao({
            mensagem: `Status do agendamento de ${a.disciplina} alterado para ${status.toUpperCase()}.`,
            dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            tipo: status === "cancelado" ? "cancelamento" : "confirmacao",
          });
          return updated;
        }
        return a;
      })
    );
  };

  // Delete Agendamento
  const deleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  };

  // Disciplinas
  const addDisciplina = (disc: Omit<DisciplinaItem, "id">): DisciplinaItem => {
    const item: DisciplinaItem = {
      ...disc,
      id: `d_${Date.now()}`,
    };
    setDisciplinas((prev) => [item, ...prev]);
    return item;
  };

  const updateDisciplina = (id: string, updates: Partial<DisciplinaItem>) => {
    setDisciplinas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDisciplina = (id: string) => {
    setDisciplinas((prev) => prev.filter((d) => d.id !== id));
  };

  // Usuários
  const addUsuario = (user: Omit<Usuario, "id">): Usuario => {
    const novo: Usuario = {
      ...user,
      id: `u_${Date.now()}`,
    };
    setUsuarios((prev) => [novo, ...prev]);
    addNotificacao({
      mensagem: `Novo usuário registrado: ${novo.nome} (${novo.perfil}).`,
      dataHora: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      tipo: "sistema",
    });
    return novo;
  };

  const updateUsuario = (id: string, updates: Partial<Usuario>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  // Notificações
  const addNotificacao = (notif: Omit<Notificacao, "id">) => {
    const n: Notificacao = {
      ...notif,
      id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setNotificacoes((prev) => [n, ...prev]);
  };

  const deleteNotificacao = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotificacoes = () => {
    setNotificacoes([]);
  };

  // Configurações
  const updateConfiguracoes = (updates: Partial<Configuracoes>) => {
    setConfiguracoes((prev) => ({ ...prev, ...updates }));
  };

  // Switch User
  const switchUser = (id: string) => {
    setCurrentUserId(id);
  };

  // Open modal with prefilled data
  const openNovoAgendamento = (salaCodigo?: string, disciplinaCodigo?: string) => {
    setPreselectedSalaCodigo(salaCodigo);
    setPreselectedDisciplinaCodigo(disciplinaCodigo);
    setNovoAgendamentoOpen(true);
  };

  // Computed Indicators
  const indicadores: Indicador[] = useMemo(() => {
    const totalSalas = salas.length;
    const hojeStr = new Date().toISOString().slice(0, 10);
    // Include 2026-09-03 or today's bookings for rich display
    const agendamentosHoje = agendamentos.filter(
      (a) => a.data === hojeStr || a.data === "2026-09-03"
    ).length;

    // Count conflicts
    let conflitosCount = 0;
    const checked = new Set<string>();
    for (const a of agendamentos) {
      if (a.status === "cancelado") continue;
      const key = `${a.data}_${a.salaCodigo}_${a.horaInicio}_${a.horaFim}`;
      if (checked.has(key)) {
        conflitosCount++;
      } else {
        checked.add(key);
      }
    }

    const salasOcupadas = salas.filter((s) => s.status === "ocupada").length;
    const taxaOcupacao = totalSalas > 0 ? Math.round((salasOcupadas / totalSalas) * 100) : 0;

    return [
      {
        label: "Salas e laboratórios",
        value: String(totalSalas).padStart(2, "0"),
        change: `${salas.filter((s) => s.status === "disponível").length} disponíveis agora`,
        trend: "up",
      },
      {
        label: "Agendamentos de hoje",
        value: String(agendamentosHoje).padStart(2, "0"),
        change: `${agendamentos.filter((a) => a.status === "pendente").length} pendentes de aprovação`,
        trend: "up",
      },
      {
        label: "Conflitos de horário",
        value: String(conflitosCount).padStart(2, "0"),
        change: conflitosCount === 0 ? "Nenhum conflito ativo" : "Aguardando ajuste",
        trend: conflitosCount > 0 ? "down" : "neutral",
      },
      {
        label: "Taxa de ocupação",
        value: `${taxaOcupacao}%`,
        change: `${salasOcupadas} de ${totalSalas} salas em uso`,
        trend: "up",
      },
    ];
  }, [salas, agendamentos]);

  return (
    <StoreContext.Provider
      value={{
        salas,
        addSala,
        updateSala,
        deleteSala,
        setSalaStatus,

        agendamentos,
        addAgendamento,
        updateAgendamentoStatus,
        deleteAgendamento,
        checkConflict,

        disciplinas,
        addDisciplina,
        updateDisciplina,
        deleteDisciplina,

        usuarios,
        addUsuario,
        updateUsuario,
        deleteUsuario,

        notificacoes,
        unreadNotificacoesCount,
        addNotificacao,
        deleteNotificacao,
        clearAllNotificacoes,

        configuracoes,
        updateConfiguracoes,

        currentUser,
        switchUser,

        indicadores,

        novoAgendamentoOpen,
        setNovoAgendamentoOpen,
        preselectedSalaCodigo,
        preselectedDisciplinaCodigo,
        openNovoAgendamento,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
