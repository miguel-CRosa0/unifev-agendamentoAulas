import React, { createContext, useContext, useMemo, useState } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type Agendamento,
  type Configuracoes,
  type DisciplinaItem,
  type Indicador,
  type Notificacao,
  type Perfil,
  type Sala,
  type StatusAgendamento,
  type StatusSala,
  type Usuario,
  configuracoesPadrao,
} from "@/components/dashboard/data";
import {
  alterarStatusAgendamento,
  alterarStatusSala,
  atualizarConfiguracoes,
  atualizarDisciplina,
  atualizarSala,
  atualizarUsuario,
  criarAgendamento,
  criarDisciplina,
  criarSala,
  criarUsuario,
  excluirAgendamento,
  excluirDisciplina,
  excluirNotificacao,
  excluirSala,
  excluirUsuario,
  getDados,
  limparNotificacoes,
  redefinirSenhaUsuario,
} from "@/lib/api";
import { mensagemErro } from "@/lib/erros";

export type { DisciplinaItem, Configuracoes };

export const dadosQueryOptions = queryOptions({
  queryKey: ["dados"],
  queryFn: () => getDados(),
});

export interface NovoUsuario {
  nome: string;
  email: string;
  ra: string;
  telefone?: string;
  nascimento: string;
  perfil: Exclude<Perfil, "Administrador">;
  nivelAcesso: string[];
}

interface StoreContextType {
  // Salas
  salas: Sala[];
  addSala: (nova: Omit<Sala, "id">) => Promise<boolean>;
  updateSala: (id: string, updates: Partial<Omit<Sala, "id">>) => Promise<boolean>;
  deleteSala: (id: string) => Promise<boolean>;
  setSalaStatus: (id: string, status: StatusSala) => Promise<boolean>;

  // Agendamentos
  agendamentos: Agendamento[];
  addAgendamento: (
    novo: Omit<
      Agendamento,
      "id" | "status" | "salaNome" | "salaLocalizacao" | "solicitanteId" | "solicitanteNome" | "solicitantePerfil"
    >,
  ) => Promise<{ success: boolean; message: string }>;
  updateAgendamentoStatus: (id: string, status: StatusAgendamento) => Promise<boolean>;
  deleteAgendamento: (id: string) => Promise<boolean>;
  checkConflict: (
    data: string,
    horaInicio: string,
    horaFim: string,
    salaCodigo: string,
    excludeId?: string,
  ) => Agendamento | null;

  // Disciplinas
  disciplinas: DisciplinaItem[];
  addDisciplina: (disc: Omit<DisciplinaItem, "id">) => Promise<boolean>;
  updateDisciplina: (id: string, updates: Partial<Omit<DisciplinaItem, "id">>) => Promise<boolean>;
  deleteDisciplina: (id: string) => Promise<boolean>;

  // Usuários
  usuarios: Usuario[];
  addUsuario: (user: NovoUsuario) => Promise<{ senhaTemporaria: string } | null>;
  updateUsuario: (
    id: string,
    updates: Pick<Usuario, "nome" | "email" | "perfil" | "nivelAcesso">,
  ) => Promise<boolean>;
  deleteUsuario: (id: string) => Promise<boolean>;
  resetSenhaUsuario: (id: string) => Promise<{ senhaTemporaria: string } | null>;

  // Notificações
  notificacoes: Notificacao[];
  unreadNotificacoesCount: number;
  deleteNotificacao: (id: string) => Promise<boolean>;
  clearAllNotificacoes: () => Promise<boolean>;

  // Configurações
  configuracoes: Configuracoes;
  updateConfiguracoes: (updates: Partial<Configuracoes>) => Promise<boolean>;

  // Usuário logado e permissões (as mesmas conferidas no servidor)
  currentUser: Usuario;
  isAdmin: boolean;
  isGestao: boolean;

  // Indicadores calculados
  indicadores: Indicador[];

  // Estado global do diálogo de agendamento
  novoAgendamentoOpen: boolean;
  setNovoAgendamentoOpen: (open: boolean) => void;
  preselectedSalaCodigo?: string | undefined;
  preselectedDisciplinaCodigo?: string | undefined;
  openNovoAgendamento: (salaCodigo?: string, disciplinaCodigo?: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Referências estáveis enquanto os dados carregam (evita recalcular os indicadores)
const SEM_SALAS: Sala[] = [];
const SEM_AGENDAMENTOS: Agendamento[] = [];

export function StoreProvider({
  currentUser,
  children,
}: {
  currentUser: Usuario;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery(dadosQueryOptions);

  const salas = data?.salas ?? SEM_SALAS;
  const agendamentos = data?.agendamentos ?? SEM_AGENDAMENTOS;
  const disciplinas = data?.disciplinas ?? [];
  const usuarios = data?.usuarios ?? [];
  const notificacoes = data?.notificacoes ?? [];
  const configuracoes = data?.configuracoes ?? configuracoesPadrao;

  const [novoAgendamentoOpen, setNovoAgendamentoOpen] = useState(false);
  const [preselectedSalaCodigo, setPreselectedSalaCodigo] = useState<string | undefined>();
  const [preselectedDisciplinaCodigo, setPreselectedDisciplinaCodigo] = useState<string | undefined>();

  /** Executa a operação no servidor, recarrega os dados e mostra o erro, se houver. */
  async function executar<T>(operacao: () => Promise<T>): Promise<T | null> {
    try {
      const resultado = await operacao();
      await queryClient.invalidateQueries({ queryKey: dadosQueryOptions.queryKey });
      return resultado;
    } catch (e) {
      toast.error(mensagemErro(e));
      return null;
    }
  }

  const ok = async (operacao: () => Promise<unknown>) => (await executar(async () => (await operacao(), true))) ?? false;

  // Verificação local para feedback imediato; o servidor confere de novo ao salvar.
  const checkConflict = (
    data: string,
    horaInicio: string,
    horaFim: string,
    salaCodigo: string,
    excludeId?: string,
  ): Agendamento | null =>
    agendamentos.find((a) => {
      if (excludeId && a.id === excludeId) return false;
      if (a.status === "cancelado") return false;
      if (a.data !== data || a.salaCodigo !== salaCodigo) return false;
      return a.horaInicio < horaFim && a.horaFim > horaInicio;
    }) ?? null;

  const addAgendamento: StoreContextType["addAgendamento"] = async (novo) =>
    (await executar(() =>
      criarAgendamento({
        data: {
          data: novo.data,
          horaInicio: novo.horaInicio,
          horaFim: novo.horaFim,
          salaCodigo: novo.salaCodigo,
          disciplina: novo.disciplina,
          disciplinaCodigo: novo.disciplinaCodigo,
          turma: novo.turma,
          professorResponsavel: novo.professorResponsavel,
          alunos: novo.alunos,
        },
      }),
    )) ?? { success: false, message: "Não foi possível salvar o agendamento." };

  const indicadores: Indicador[] = useMemo(() => {
    const totalSalas = salas.length;
    const hojeStr = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const agendamentosHoje = agendamentos.filter((a) => a.data === hojeStr && a.status !== "cancelado").length;

    let conflitosCount = 0;
    const checked = new Set<string>();
    for (const a of agendamentos) {
      if (a.status === "cancelado") continue;
      const key = `${a.data}_${a.salaCodigo}_${a.horaInicio}_${a.horaFim}`;
      if (checked.has(key)) conflitosCount++;
      else checked.add(key);
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

  const openNovoAgendamento = (salaCodigo?: string, disciplinaCodigo?: string) => {
    setPreselectedSalaCodigo(salaCodigo);
    setPreselectedDisciplinaCodigo(disciplinaCodigo);
    setNovoAgendamentoOpen(true);
  };

  return (
    <StoreContext.Provider
      value={{
        salas,
        addSala: (nova) => ok(() => criarSala({ data: nova })),
        updateSala: (id, dados) => ok(() => atualizarSala({ data: { id, dados } })),
        deleteSala: (id) => ok(() => excluirSala({ data: { id } })),
        setSalaStatus: (id, status) => ok(() => alterarStatusSala({ data: { id, status } })),

        agendamentos,
        addAgendamento,
        updateAgendamentoStatus: (id, status) => ok(() => alterarStatusAgendamento({ data: { id, status } })),
        deleteAgendamento: (id) => ok(() => excluirAgendamento({ data: { id } })),
        checkConflict,

        disciplinas,
        addDisciplina: (disc) => ok(() => criarDisciplina({ data: disc })),
        updateDisciplina: (id, dados) => ok(() => atualizarDisciplina({ data: { id, dados } })),
        deleteDisciplina: (id) => ok(() => excluirDisciplina({ data: { id } })),

        usuarios,
        addUsuario: (user) => executar(() => criarUsuario({ data: user })),
        updateUsuario: (id, dados) => ok(() => atualizarUsuario({ data: { id, ...dados } })),
        deleteUsuario: (id) => ok(() => excluirUsuario({ data: { id } })),
        resetSenhaUsuario: (id) => executar(() => redefinirSenhaUsuario({ data: { id } })),

        notificacoes,
        unreadNotificacoesCount: notificacoes.length,
        deleteNotificacao: (id) => ok(() => excluirNotificacao({ data: { id } })),
        clearAllNotificacoes: () => ok(() => limparNotificacoes()),

        configuracoes,
        updateConfiguracoes: (updates) => ok(() => atualizarConfiguracoes({ data: updates })),

        currentUser,
        isAdmin: currentUser.perfil === "Administrador",
        isGestao: currentUser.perfil === "Administrador" || currentUser.perfil === "Coordenador",

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
