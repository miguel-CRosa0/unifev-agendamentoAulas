import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, KeyRound, LogIn, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — SalaFácil" },
      { name: "description", content: "Acesse o SalaFácil com seu RA e senha para agendar salas e laboratórios." },
      { property: "og:title", content: "Entrar — SalaFácil" },
      { property: "og:description", content: "Acesso ao sistema de agendamento de salas e laboratórios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { usuarios, switchUser } = useStore();
  const [ra, setRa] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // Senha temporária = data de nascimento (ex.: 10082004)
  const senhaTemporaria = /^\d{8}$/.test(senha);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!ra || !senha) {
      setErro("Informe o RA e a senha.");
      return;
    }
    setErro("");

    // Look for matching user or fallback to first
    const matched = usuarios.find((u) => u.email.includes(ra) || u.nome.toLowerCase().includes(ra.toLowerCase()));
    if (matched) {
      switchUser(matched.id);
    } else {
      const first = usuarios[0];
      if (first) {
        switchUser(first.id);
      }
    }

    if (senhaTemporaria) {
      toast.info("Senha temporária detectada. Redirecionando para definição de senha pessoal.");
      navigate({ to: "/nova-senha", search: { ra } });
      return;
    }

    toast.success("Login realizado com sucesso! Bem-vindo ao SalaFácil.");
    navigate({ to: "/" });
  }

  const quickLoginAs = (userIndex: number) => {
    const user = usuarios[userIndex] || usuarios[0];
    if (user) {
      switchUser(user.id);
      toast.success(`Entrando como ${user.nome} (${user.perfil})...`);
      navigate({ to: "/" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">SalaFácil</span>
            <p className="text-[11px] text-muted-foreground">Sistema Integrado de Gestão de Salas</p>
          </div>
        </div>

        <h1 className="mt-6 text-xl font-bold text-foreground">Entrar no Sistema</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu RA institucional e senha. No primeiro acesso, sua senha é a data de nascimento (ex.: 10082004).
        </p>

        <form className="mt-6 space-y-4" onSubmit={entrar}>
          <div className="space-y-1.5">
            <Label htmlFor="ra">RA (Registro Acadêmico / Identificação)</Label>
            <Input
              id="ra"
              inputMode="numeric"
              placeholder="Ex: 20260014"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha de Acesso</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> {erro}
            </p>
          )}

          <Button type="submit" className="w-full font-medium gap-1.5">
            <LogIn className="h-4 w-4" /> Entrar
          </Button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Acesso Rápido de Demonstração:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickLoginAs(0)}
              className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/40 transition-colors"
            >
              <p className="font-semibold text-foreground">Administrador</p>
              <p className="text-[10px] text-muted-foreground">Marcos Andrade</p>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs(1)}
              className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/40 transition-colors"
            >
              <p className="font-semibold text-foreground">Coordenadora</p>
              <p className="text-[10px] text-muted-foreground">Carla Mendes</p>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs(2)}
              className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/40 transition-colors"
            >
              <p className="font-semibold text-foreground">Professora</p>
              <p className="text-[10px] text-muted-foreground">Ana Souza</p>
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs(3)}
              className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/40 transition-colors"
            >
              <p className="font-semibold text-foreground">Professor</p>
              <p className="text-[10px] text-muted-foreground">Gabriel Teixeira</p>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
          <KeyRound className="h-4 w-4 shrink-0 text-primary" />
          Primeiro acesso? Digite qualquer RA e data no formato DDMMAAAA para testar a troca de senha.
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Gestão centralizada de novos acessos pelo painel de{" "}
          <Link to="/cadastro" className="font-medium text-primary hover:underline">
            Cadastro de Usuários
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
