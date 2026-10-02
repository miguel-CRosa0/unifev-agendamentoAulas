import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, RotateCcw, Save, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({
    meta: [
      { title: "Configurações — SalaFácil" },
      { name: "description", content: "Preferências da instituição, regras de agendamento e política de senhas do sistema." },
      { property: "og:title", content: "Configurações — SalaFácil" },
      { property: "og:description", content: "Regras de agendamento e segurança de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ConfiguracoesPage() {
  const { configuracoes, updateConfiguracoes } = useStore();

  const [antecedencia, setAntecedencia] = useState(configuracoes.antecedenciaMinima);
  const [duracao, setDuracao] = useState(configuracoes.duracaoMaxima);
  const [bloquearConflitos, setBloquearConflitos] = useState(configuracoes.bloquearConflitos);
  const [aprovacaoCoordenador, setAprovacaoCoordenador] = useState(configuracoes.aprovacaoCoordenador);
  const [senhaTemporariaNascimento, setSenhaTemporariaNascimento] = useState(configuracoes.senhaTemporariaNascimento);
  const [trocaObrigatoriaPrimeiroLogin, setTrocaObrigatoriaPrimeiroLogin] = useState(configuracoes.trocaObrigatoriaPrimeiroLogin);
  const [tamanhoMinimoSenha, setTamanhoMinimoSenha] = useState(configuracoes.tamanhoMinimoSenha);

  useEffect(() => {
    setAntecedencia(configuracoes.antecedenciaMinima);
    setDuracao(configuracoes.duracaoMaxima);
    setBloquearConflitos(configuracoes.bloquearConflitos);
    setAprovacaoCoordenador(configuracoes.aprovacaoCoordenador);
    setSenhaTemporariaNascimento(configuracoes.senhaTemporariaNascimento);
    setTrocaObrigatoriaPrimeiroLogin(configuracoes.trocaObrigatoriaPrimeiroLogin);
    setTamanhoMinimoSenha(configuracoes.tamanhoMinimoSenha);
  }, [configuracoes]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfiguracoes({
      antecedenciaMinima: Number(antecedencia) || 24,
      duracaoMaxima: Number(duracao) || 100,
      bloquearConflitos,
      aprovacaoCoordenador,
      senhaTemporariaNascimento,
      trocaObrigatoriaPrimeiroLogin,
      tamanhoMinimoSenha: Number(tamanhoMinimoSenha) || 8,
    });
    toast.success("Configurações do sistema salvas com sucesso!");
  };

  const handleRestaurarPadroes = () => {
    updateConfiguracoes({
      antecedenciaMinima: 24,
      duracaoMaxima: 100,
      bloquearConflitos: true,
      aprovacaoCoordenador: true,
      senhaTemporariaNascimento: true,
      trocaObrigatoriaPrimeiroLogin: true,
      tamanhoMinimoSenha: 8,
    });
    toast.info("Configurações restauradas para os valores padrão de fábrica.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações Gerais</h1>
          <p className="text-sm text-muted-foreground">
            Definições de políticas acadêmicas, regras de conflito de horários e parâmetros de segurança.
          </p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Scheduling Rules */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Regras de Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="antecedencia">Antecedência mínima para reserva (horas)</Label>
                  <Input
                    id="antecedencia"
                    type="number"
                    min={0}
                    max={720}
                    value={antecedencia}
                    onChange={(e) => setAntecedencia(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Tempo prévio exigido para submeter pedidos de sala.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="duracao">Duração máxima por reserva (minutos)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    min={30}
                    max={600}
                    value={duracao}
                    onChange={(e) => setDuracao(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Equivalente padrão a 2 blocos de 50min (100min).</p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-foreground">Bloquear conflitos de horário</p>
                    <p className="text-xs text-muted-foreground">
                      Impede sumariamente duas reservas simultâneas na mesma sala no mesmo turno/horário.
                    </p>
                  </div>
                  <Switch
                    checked={bloquearConflitos}
                    onCheckedChange={setBloquearConflitos}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-foreground">Aprovação obrigatória pela coordenação</p>
                    <p className="text-xs text-muted-foreground">
                      Novas reservas submetidas entram como pendentes até homologação pela coordenação ou administração.
                    </p>
                  </div>
                  <Switch
                    checked={aprovacaoCoordenador}
                    onCheckedChange={setAprovacaoCoordenador}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Access & Password Rules */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Segurança, Acessos e Senhas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-foreground">Senha temporária pela data de nascimento</p>
                    <p className="text-xs text-muted-foreground">
                      Gera automaticamente credencial temporária DDMMAAAA na criação do usuário pelo administrador.
                    </p>
                  </div>
                  <Switch
                    checked={senhaTemporariaNascimento}
                    onCheckedChange={setSenhaTemporariaNascimento}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-foreground">Troca obrigatória no primeiro login</p>
                    <p className="text-xs text-muted-foreground">
                      Obriga o usuário a cadastrar senha pessoal no primeiro acesso antes de navegar.
                    </p>
                  </div>
                  <Switch
                    checked={trocaObrigatoriaPrimeiroLogin}
                    onCheckedChange={setTrocaObrigatoriaPrimeiroLogin}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minsenha">Tamanho mínimo da senha (caracteres)</Label>
                  <Input
                    id="minsenha"
                    type="number"
                    min={6}
                    max={32}
                    value={tamanhoMinimoSenha}
                    onChange={(e) => setTamanhoMinimoSenha(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Requisito de complexidade para senhas definitivas.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRestaurarPadroes}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar Padrões
            </Button>

            <Button type="submit" className="gap-1.5 shadow-sm">
              <Save className="h-4 w-4" /> Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
