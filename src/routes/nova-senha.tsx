import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { getRegrasSenha, trocarMinhaSenha } from "@/lib/api";
import { mensagemErro } from "@/lib/erros";
import { sessaoQueryOptions } from "@/lib/sessao";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/nova-senha")({
  loader: () => getRegrasSenha(),
  component: NovaSenhaPage,
  head: () => ({
    meta: [
      { title: "Definir nova senha — SalaFácil" },
      { name: "description", content: "Primeiro acesso: troque a senha temporária por uma senha definitiva." },
      { property: "og:title", content: "Definir nova senha — SalaFácil" },
      { property: "og:description", content: "Troca obrigatória da senha temporária no primeiro acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function NovaSenhaPage() {
  const { sessao } = Route.useRouteContext();
  const { tamanhoMinimo } = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");

  const forte = senha.length >= tamanhoMinimo && /[A-Za-z]/.test(senha) && /\d/.test(senha);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!forte) {
      setErro(`A senha deve ter ao menos ${tamanhoMinimo} caracteres, com letras e números.`);
      return;
    }
    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await trocarMinhaSenha({ data: { novaSenha: senha } });
    } catch (err) {
      setErro(mensagemErro(err, "Não foi possível salvar a senha."));
      setSalvando(false);
      return;
    }
    // Busca a sessão de novo (o cache ainda diz que a troca é obrigatória e
    // faria a rota redirecionar de volta para esta tela)
    await queryClient.fetchQuery({ ...sessaoQueryOptions, staleTime: 0 });
    toast.success("Nova senha definida com sucesso! Acesso liberado.");
    await navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border border-t-4 border-t-primary bg-card p-8 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Crie sua nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sessao?.ra ? `RA ${sessao.ra} — ` : ""}defina uma senha pessoal para continuar.
        </p>

        <form className="mt-7 space-y-5" onSubmit={salvar}>
          <div className="space-y-2">
            <Label htmlFor="nova">Nova senha</Label>
            <Input id="nova" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirma">Confirmar senha</Label>
            <Input id="confirma" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="••••••••" />
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Mínimo de {tamanhoMinimo} caracteres</li>
            <li>Ao menos uma letra e um número</li>
            <li>Recomendado: use uma senha forte, misturando maiúsculas, minúsculas e símbolos</li>
          </ul>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={salvando}>
            {salvando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Salvar e continuar
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3 rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          A senha é armazenada criptografada, nunca em texto puro.
        </div>
      </div>
    </div>
  );
}
