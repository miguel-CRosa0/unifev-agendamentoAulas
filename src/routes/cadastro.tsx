import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Perfil } from "@/components/dashboard/data";

export const Route = createFileRoute("/cadastro")({
  beforeLoad: ({ context }) => {
    if (context.sessao?.perfil !== "Administrador") throw redirect({ to: "/" });
  },
  component: CadastroPage,
  head: () => ({
    meta: [
      { title: "Cadastro de usuários — Agendamento de Aulas" },
      { name: "description", content: "Área do administrador para cadastrar professores e coordenadores com senha temporária." },
      { property: "og:title", content: "Cadastro de usuários — Agendamento de Aulas" },
      { property: "og:description", content: "Cadastro de usuários com RA, dados pessoais e senha temporária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export function CadastroPage() {
  const { usuarios, addUsuario, configuracoes } = useStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [ra, setRa] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [perfil, setPerfil] = useState<Exclude<Perfil, "Administrador">>("Professor");
  const [criadoInfo, setCriadoInfo] = useState<{ nome: string; senhaTemporaria: string } | null>(null);

  const senhaPorNascimento = configuracoes.senhaTemporariaNascimento;
  const senhaPrevista = nascimento ? nascimento.split("-").reverse().join("") : "DDMMAAAA";

  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !email || !ra || !nascimento) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    const resultado = await addUsuario({ nome, email, ra, telefone, nascimento, perfil });
    setSalvando(false);
    if (!resultado) return;

    setCriadoInfo({ nome, senhaTemporaria: resultado.senhaTemporaria });
    toast.success(`Usuário ${nome} cadastrado com sucesso! Senha temporária: ${resultado.senhaTemporaria}`);

    setNome("");
    setTelefone("");
    setEmail("");
    setRa("");
    setNascimento("");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Cadastro de Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre professores e coordenadores. Eles entram com o RA e a senha temporária.
            </p>
          </div>
          <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Acesso de Administrador
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-border bg-card xl:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <UserPlus className="h-4 w-4 text-primary" />
                Dados do Novo Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={salvar}>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    placeholder="Nome e sobrenome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    placeholder="(DDD) número"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail Institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@unifev.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ra">RA / Registro Acadêmico</Label>
                  <Input
                    id="ra"
                    inputMode="numeric"
                    placeholder="Somente letras e números"
                    value={ra}
                    onChange={(e) => setRa(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nascimento">Data de Nascimento</Label>
                  <Input
                    id="nascimento"
                    type="date"
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="perfil">Perfil de Acesso (Papel)</Label>
                  <Select value={perfil} onValueChange={(v) => setPerfil(v as Exclude<Perfil, "Administrador">)}>
                    <SelectTrigger id="perfil">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coordenador">Coordenador — também professor, aprova agendamentos</SelectItem>
                      <SelectItem value="Professor">Professor — solicita agendamentos para aprovação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm sm:col-span-2">
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Senha Temporária Gerada Automaticamente
                  </p>
                  {senhaPorNascimento ? (
                    <>
                      <p className="mt-1 font-mono text-2xl font-bold text-primary">{senhaPrevista}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Data de nascimento no formato DDMMAAAA.
                        {configuracoes.trocaObrigatoriaPrimeiroLogin &&
                          " No primeiro acesso (login com o RA) o usuário terá de definir uma senha pessoal."}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uma senha aleatória será gerada e exibida após o cadastro.
                      {configuracoes.trocaObrigatoriaPrimeiroLogin &&
                        " No primeiro acesso (login com o RA) o usuário terá de definir uma senha pessoal."}
                    </p>
                  )}
                </div>

                {criadoInfo && (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-700 dark:text-blue-400 sm:col-span-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>
                      Usuário <strong>{criadoInfo.nome}</strong> cadastrado! Senha temporária:{" "}
                      <span className="font-mono font-bold">{criadoInfo.senhaTemporaria}</span>.
                    </span>
                  </div>
                )}

                <div className="flex gap-2 sm:col-span-2 pt-2">
                  <Button type="submit" className="gap-1.5" disabled={salvando}>
                    <UserPlus className="h-4 w-4" /> Cadastrar Usuário
                  </Button>
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => {
                      setNome("");
                      setTelefone("");
                      setEmail("");
                      setRa("");
                      setNascimento("");
                      setCriadoInfo(null);
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Usuários Ativos
                </CardTitle>
                <Link to="/usuarios" className="text-xs text-primary hover:underline font-medium">
                  Ver todos ({usuarios.length})
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {usuarios.slice(0, 6).map((u) => (
                <div key={u.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-foreground">{u.nome}</p>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                      {u.perfil}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{u.email}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
