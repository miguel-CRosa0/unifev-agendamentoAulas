import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { sessaoQueryOptions } from "@/lib/sessao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Marca } from "@/components/dashboard/layout";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — Agendamento de Aulas" },
      { name: "description", content: "Acesse o sistema com seu RA (ou e-mail) e senha para agendar salas e laboratórios." },
      { property: "og:title", content: "Entrar — Agendamento de Aulas" },
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
  const [verSenha, setVerSenha] = useState(false);
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
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.27_0.1_260)] p-12 text-white lg:flex">
        <Marca invertida />

        <div className="max-w-md">
          <h2 className="animate-rise text-4xl font-semibold leading-[1.1] tracking-tight">
            Cada aula no seu horário. Cada turma na sua sala.
          </h2>
          <p style={{ "--i": 2 } as React.CSSProperties} className="animate-rise mt-5 text-base leading-relaxed text-white/70">
            Reserve salas e laboratórios, acompanhe conflitos de horário e veja a ocupação do campus em um só lugar.
          </p>
        </div>

        <p className="text-sm text-white/50">Unifev · Gestão de salas</p>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 grid -translate-y-1/2 grid-cols-4 gap-2 opacity-[0.07]"
        >
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} className={`h-20 w-20 rounded-md ${i % 5 === 1 || i % 7 === 3 ? "bg-white" : "border border-current"}`} />
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-10">
        <div className="animate-rise w-full max-w-[22rem]">
          <div className="mb-10 text-foreground lg:hidden">
            <Marca />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Entrar</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Use seu RA institucional ou e-mail.</p>

          <form className="mt-8 space-y-4" onSubmit={entrar}>
            <div className="space-y-1.5">
              <Label htmlFor="login">RA ou e-mail</Label>
              <Input
                id="login"
                autoComplete="username"
                autoCapitalize="none"
                className="h-10"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={verSenha ? "text" : "password"}
                  autoComplete="current-password"
                  className="h-10 pr-11"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha((v) => !v)}
                  aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={verSenha}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {verSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <p role="alert" className="flex items-center gap-1.5 text-[13px] text-destructive">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> {erro}
              </p>
            )}

            <Button type="submit" className="h-10 w-full gap-2" disabled={entrando}>
              {entrando && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
            </Button>
          </form>

          <div className="mt-8 border-t border-border pt-5 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Primeiro acesso?</span> Entre com a senha temporária passada
              pelo administrador; em seguida você define a sua.
            </p>
            <p className="mt-2">Sem acesso? Peça o cadastro ao administrador do sistema.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
