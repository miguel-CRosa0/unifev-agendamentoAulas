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
      { name: "description", content: "Acesse o SalaFácil com seu RA (ou e-mail) e senha para agendar salas e laboratórios." },
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
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const identificacao = login.trim();
    if (!identificacao || !senha) {
      setErro("Informe o RA ou e-mail e a senha.");
      return;
    }
    setErro("");
    setEntrando(true);

    // Com "@" é e-mail (ex.: administrador); senão, RA
    const { error } = identificacao.includes("@")
      ? await authClient.signIn.email({ email: identificacao.toLowerCase(), password: senha })
      : await authClient.signIn.username({ username: identificacao, password: senha });
    if (error) {
      setEntrando(false);
      setErro(error.status === 401 ? "RA/e-mail ou senha incorretos." : "Não foi possível entrar. Tente novamente.");
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
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Faixa institucional */}
      <div className="flex flex-col justify-between bg-sidebar px-8 py-8 text-sidebar-foreground lg:w-[42%] lg:px-14 lg:py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-primary">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="leading-tight">
            <span className="block text-2xl font-bold text-white">SalaFácil</span>
            <span className="block text-sm text-sidebar-foreground/80">Unifev · Agendamento de salas</span>
          </div>
        </div>

        <div className="hidden max-w-md lg:block">
          <p className="text-3xl font-bold leading-snug text-white">
            Reserve salas de aula e laboratórios de forma simples.
          </p>
          <p className="mt-4 text-lg text-sidebar-foreground/85">
            Consulte a disponibilidade, faça seus agendamentos e acompanhe tudo em um só lugar.
          </p>
        </div>

        <p className="hidden text-sm text-sidebar-foreground/70 lg:block">
          Centro Universitário de Votuporanga
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground">Entrar no sistema</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Informe seu RA (ou e-mail) e sua senha.
          </p>

          <form className="mt-8 space-y-5" onSubmit={entrar}>
            <div className="space-y-2">
              <Label htmlFor="login">RA ou e-mail</Label>
              <Input
                id="login"
                autoComplete="username"
                autoCapitalize="none"
                className="h-12 text-lg"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                className="h-12 text-lg"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
              >
                <ShieldAlert className="h-5 w-5 shrink-0" /> {erro}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={entrando}>
              {entrando ? <Loader2 className="animate-spin" /> : <LogIn />} Entrar
            </Button>
          </form>

          <div className="mt-8 flex gap-3 rounded-md bg-muted p-4 text-sm text-muted-foreground">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              <strong className="font-semibold text-foreground">Primeiro acesso?</strong> Use a senha
              temporária informada pelo administrador. Em seguida, você vai criar sua senha pessoal.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem acesso? Peça o cadastro ao administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
