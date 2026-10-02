import { useState } from "react";
import {
  KeyRound,
  MoreVertical,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Perfil, Usuario } from "./data";

function perfilColor(perfil: Usuario["perfil"]) {
  switch (perfil) {
    case "Administrador":
      return "bg-primary/10 text-primary border-transparent font-semibold";
    case "Coordenador":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-transparent font-semibold";
    case "Professor":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent font-semibold";
    default:
      return "bg-secondary text-secondary-foreground border-transparent font-semibold";
  }
}

const AVAILABLE_PERMISSIONS = [
  "Gerenciar salas",
  "Gerenciar usuários",
  "Definir nível de acesso",
  "Gerar relatório",
  "Realizar agendamento",
  "Editar agendamento",
  "Aprovar solicitações",
  "Ministrar disciplinas",
];

export function UsersPanel({ usuarios }: { usuarios: Usuario[] }) {
  const { updateUsuario, deleteUsuario, switchUser, currentUser } = useStore();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("todos");

  // Edit user dialog
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPerfil, setEditPerfil] = useState<Perfil>("Professor");
  const [editNivelAcesso, setEditNivelAcesso] = useState<string[]>([]);

  const filtered = usuarios.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole === "todos" || u.perfil === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditPerfil(user.perfil);
    setEditNivelAcesso(user.nivelAcesso || []);
  };

  const togglePermission = (perm: string) => {
    setEditNivelAcesso((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUsuario(editingUser.id, {
      nome: editNome,
      email: editEmail,
      perfil: editPerfil,
      tambemProfessor: editPerfil === "Coordenador",
      nivelAcesso: editNivelAcesso,
    });

    toast.success(`Usuário ${editNome} atualizado com sucesso!`);
    setEditingUser(null);
  };

  const handleResetPassword = (user: Usuario) => {
    const tempPass = "2004" + Math.floor(1000 + Math.random() * 9000);
    toast.info(
      `Nova senha temporária para ${user.nome}: ${tempPass}`,
      { duration: 8000 }
    );
  };

  const handleDeleteUser = (user: Usuario) => {
    if (user.id === currentUser.id) {
      toast.error("Você não pode excluir o usuário conectado na sessão ativa.");
      return;
    }
    if (confirm(`Tem certeza que deseja remover o usuário ${user.nome}?`)) {
      deleteUsuario(user.id);
      toast.success(`Usuário ${user.nome} removido.`);
    }
  };

  return (
    <>
      {/* Edit User Dialog */}
      <Dialog open={Boolean(editingUser)} onOpenChange={(v) => !v && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Editar Permissões do Usuário
            </DialogTitle>
            <DialogDescription>
              Ajuste o perfil de acesso e permissões individuais do sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="perfil">Perfil de Acesso</Label>
              <Select
                value={editPerfil}
                onValueChange={(v) => {
                  const perfil = v as Perfil;
                  setEditPerfil(perfil);
                  if (perfil === "Administrador") {
                    setEditNivelAcesso(AVAILABLE_PERMISSIONS);
                  } else if (perfil === "Coordenador") {
                    setEditNivelAcesso([
                      "Realizar agendamento",
                      "Editar agendamento",
                      "Aprovar solicitações",
                      "Ministrar disciplinas",
                      "Gerar relatório",
                    ]);
                  } else if (perfil === "Professor") {
                    setEditNivelAcesso(["Realizar agendamento", "Editar agendamento", "Ministrar disciplinas"]);
                  } else {
                    setEditNivelAcesso(["Realizar agendamento"]);
                  }
                }}
              >
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Coordenador">Coordenador (também Professor)</SelectItem>
                  <SelectItem value="Professor">Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Níveis e Acessos Concedidos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const checked = editNivelAcesso.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`text-left rounded-md border p-2 text-xs transition-colors ${
                        checked
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {checked ? "✓ " : "+ "}
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Usuários e Níveis de Acesso
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerenciamento de papéis (RBAC) e credenciais institucionais
              </p>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={filterRole === "todos" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterRole("todos")}
              >
                Todos ({usuarios.length})
              </Button>
              <Button
                variant={filterRole === "Administrador" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterRole("Administrador")}
              >
                Admins ({usuarios.filter((u) => u.perfil === "Administrador").length})
              </Button>
              <Button
                variant={filterRole === "Coordenador" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterRole("Coordenador")}
              >
                Coordenadores ({usuarios.filter((u) => u.perfil === "Coordenador").length})
              </Button>
              <Button
                variant={filterRole === "Professor" ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setFilterRole("Professor")}
              >
                Professores ({usuarios.filter((u) => u.perfil === "Professor").length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhum usuário corresponde aos critérios de busca.
            </div>
          ) : (
            filtered.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? "border-primary/50 bg-primary/[0.03]"
                      : "border-border bg-background hover:bg-accent/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{u.nome}</p>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            Sua Sessão Ativa
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={perfilColor(u.perfil)}>
                          {u.perfil}
                        </Badge>
                        {u.tambemProfessor && (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold"
                          >
                            Professor
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          {!isCurrent && (
                            <DropdownMenuItem
                              onClick={() => {
                                switchUser(u.id);
                                toast.success(`Sessão alternada para ${u.nome}`);
                              }}
                              className="cursor-pointer"
                            >
                              <UserCheck className="h-4 w-4 mr-2 text-primary" /> Alternar para este usuário
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleOpenEdit(u)} className="cursor-pointer">
                            <Pencil className="h-4 w-4 mr-2" /> Editar Acessos e Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(u)} className="cursor-pointer">
                            <KeyRound className="h-4 w-4 mr-2 text-amber-600" /> Gerar Senha Temporária
                          </DropdownMenuItem>
                          {!isCurrent && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(u)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir Usuário
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {u.nivelAcesso &&
                      u.nivelAcesso.map((f) => (
                        <span
                          key={f}
                          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                        >
                          {f}
                        </span>
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}
