import { createFileRoute, Link } from "@tanstack/react-router";
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
  component: CadastroPage,
  head: () => ({
    meta: [
      { title: "Cadastro de usuários — SalaFácil" },
      { name: "description", content: "Área do administrador para cadastrar professores e coordenadores com senha temporária." },
      { property: "og:title", content: "Cadastro de usuários — SalaFácil" },
      { property: "og:description", content: "Cadastro de usuários com RA, dados pessoais e senha temporária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export function CadastroPage() {
  const { usuarios, addUsuario } = useStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [ra, setRa] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Professor");
  const [criadoInfo, setCriadoInfo] = useState<{ nome: string; senhaTemporaria: string } | null>(null);

  const senhaTemporaria = nascimento ? nascimento.split("-").reverse().join("") : "--------";

  function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !email || !ra || !nascimento) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    let nivelAcesso: string[] = [];
    if (perfil === "Administrador") {
      nivelAcesso = ["Gerenciar salas", "Gerenciar usuários", "Definir nível de acesso", "Gerar relatório"];
    } else if (perfil === "Coordenador") {
      nivelAcesso = ["Realizar agendamento", "Editar agendamento", "Aprovar solicitações", "Ministrar disciplinas"];
    } else if (perfil === "Professor") {
      nivelAcesso = ["Realizar agendamento", "Editar agendamento", "Ministrar disciplinas"];
    } else {
      nivelAcesso = ["Realizar agendamento"];
    }

    addUsuario({
      nome,
      email,
      perfil,
      tambemProfessor: perfil === "Coordenador",
      nivelAcesso,
    });

    setCriadoInfo({ nome, senhaTemporaria });
    toast.success(`Usuário ${nome} cadastrado com sucesso! Senha temporária: ${senhaTemporaria}`);

    // Clear inputs
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Cadastro de Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre novos professores e coordenadores com senha temporária baseada na data de nascimento.
            </p>
          </div>
          <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Acesso de Administrador
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-border bg-card shadow-sm xl:col-span-2">
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
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 98765-4321"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail Institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="carlos.oliveira@instituicao.edu.br"
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
                    placeholder="20260088"
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
                  <Select value={perfil} onValueChange={(v) => setPerfil(v as Perfil)}>
                    <SelectTrigger id="perfil">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador — Acesso irrestrito a salas e configurações</SelectItem>
                      <SelectItem value="Coordenador">Coordenador — Também Professor, aprova reservas</SelectItem>
                      <SelectItem value="Professor">Professor — Solicitação direta e gestão de turmas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm sm:col-span-2">
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Senha Temporária Gerada Automaticamente
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-primary">{senhaTemporaria}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Calculada automaticamente como a data de nascimento no formato DDMMAAAA. No primeiro acesso pelo login com o RA, o usuário será conduzido à troca obrigatória por senha forte criptografada.
                  </p>
                </div>

                {criadoInfo && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400 sm:col-span-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>
                      Usuário <strong>{criadoInfo.nome}</strong> cadastrado! Senha temporária:{" "}
                      <span className="font-mono font-bold">{criadoInfo.senhaTemporaria}</span>.
                    </span>
                  </div>
                )}

                <div className="flex gap-2 sm:col-span-2 pt-2">
                  <Button type="submit" className="gap-1.5">
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

          <Card className="border-border bg-card shadow-sm">
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
