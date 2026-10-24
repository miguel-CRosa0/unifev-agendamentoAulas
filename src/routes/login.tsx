import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, KeyRound, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { sessaoQueryOptions } from "@/lib/sessao";
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
  const queryClient = useQueryClient();
  const [ra, setRa] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!ra || !senha) {
      setErro("Informe o RA e a senha.");
      return;
    }
    setErro("");
    setEntrando(true);

    const { error } = await authClient.signIn.username({ username: ra.trim(), password: senha });
    if (error) {
      setEntrando(false);
      setErro("RA ou senha incorretos.");
      return;
    }

    queryClient.clear();
    const sessao = await queryClient.fetchQuery(sessaoQueryOptions);
    setEntrando(false);

    if (sessao?.mustChangePassword) {
      toast.info("Primeiro acesso: defina sua senha pessoal para continuar.");
      navigate({ to: "/nova-senha" });
      return;
    }

    toast.success(`Bem-vindo(a), ${sessao?.nome ?? ""}!`);
    navigate({ to: "/" });
  }

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

          <Button type="submit" className="w-full font-medium gap-1.5" disabled={entrando}>
            {entrando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Entrar
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
          <KeyRound className="h-4 w-4 shrink-0 text-primary" />
          Primeiro acesso? Use a senha temporária informada pelo administrador (sua data de nascimento, DDMMAAAA).
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Não tem acesso? Solicite o cadastro ao administrador do sistema.
        </p>
      </div>
    </div>
  );
}
