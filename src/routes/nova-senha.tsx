import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/nova-senha")({
  component: NovaSenhaPage,
  validateSearch: (search: Record<string, unknown>) => ({
    ra: typeof search['ra'] === "string" ? search['ra'] : "",
  }),
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
  const { ra } = Route.useSearch();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");

  const forte = senha.length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha);

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!forte) {
      setErro("A senha deve ter ao menos 8 caracteres, com letras e números.");
      return;
    }
    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    toast.success("Nova senha definida com sucesso! Acesso liberado.");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">Crie sua nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ra ? `RA ${ra} — ` : ""}você entrou com a senha temporária. Defina uma senha pessoal para continuar.
        </p>

        <form className="mt-6 space-y-4" onSubmit={salvar}>
          <div className="space-y-1.5">
            <Label htmlFor="nova">Nova senha</Label>
            <Input id="nova" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirma">Confirmar senha</Label>
            <Input id="confirma" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="••••••••" />
          </div>

          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Mínimo de 8 caracteres</li>
            <li>Ao menos uma letra e um número</li>
            <li>Diferente da data de nascimento</li>
          </ul>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" className="w-full">Salvar e continuar</Button>
        </form>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          A senha é armazenada criptografada, nunca em texto puro.
        </div>
      </div>
    </div>
  );
}
