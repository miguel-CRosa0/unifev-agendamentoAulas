import { useState } from "react";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  FileBarChart,
  GraduationCap,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useStore } from "@/context/store-context";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearchDialog } from "@/components/dashboard/global-search-dialog";
import { NovoAgendamentoDialog } from "@/components/dashboard/novo-agendamento-dialog";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: CalendarDays, label: "Agendamentos", href: "/agendamentos" },
  { icon: MapPin, label: "Salas e laboratórios", href: "/salas" },
  { icon: BookOpen, label: "Disciplinas e turmas", href: "/disciplinas" },
  { icon: Users, label: "Usuários e acessos", href: "/usuarios", adminOnly: true },
  { icon: FileBarChart, label: "Relatórios", href: "/relatorios" },
  { icon: MessageSquare, label: "Notificações", href: "/notificacoes", hasBadge: true },
  { icon: Settings, label: "Configurações", href: "/configuracoes", adminOnly: true },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { currentUser, openNovoAgendamento, unreadNotificacoesCount, isAdmin } = useStore();
  const itensMenu = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.clear();
    await router.invalidate();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Search dialog accessible globally */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NovoAgendamentoDialog />

      {/* Sidebar desktop */}
      <aside className="hidden w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <Marca />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Menu principal">
          <ItensMenu itens={itensMenu} pathname={pathname} naoLidas={unreadNotificacoesCount} />
        </nav>

        {/* User Card Bottom Sidebar */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-sidebar-accent"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                    {currentUser.nome.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-white">{currentUser.nome}</span>
                  <span className="truncate text-xs text-sidebar-foreground/75">{currentUser.perfil}</span>
                </div>
                <Settings className="h-5 w-5 shrink-0 text-sidebar-foreground/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="text-xs">
                <p className="font-semibold text-foreground">{currentUser.nome}</p>
                <p className="font-normal text-muted-foreground">
                  {currentUser.ra ? `RA ${currentUser.ra}` : currentUser.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/nova-senha" })} className="cursor-pointer">
                <KeyRound className="h-4 w-4 mr-2" /> Alterar senha
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Sair do sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[4.5rem] items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0 text-sidebar-foreground">
              <Marca />
              <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Menu principal">
                <ItensMenu
                  itens={itensMenu}
                  pathname={pathname}
                  naoLidas={unreadNotificacoesCount}
                  onNavegar={() => setOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search Trigger */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar salas, turmas ou professores"
              aria-label="Buscar salas, turmas ou professores"
              className="pl-11 bg-muted cursor-pointer"
              onClick={() => setSearchOpen(true)}
              onFocus={() => setSearchOpen(true)}
              readOnly
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/notificacoes"
              aria-label="Notificações"
              className="relative flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-6 w-6" />
              {unreadNotificacoesCount > 0 && (
                <span className="absolute top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
                  {unreadNotificacoesCount}
                </span>
              )}
            </Link>

            <Button
              onClick={() => openNovoAgendamento()}
              className="hidden sm:inline-flex"
            >
              <Plus />
              Novo agendamento
            </Button>
            <Button
              onClick={() => openNovoAgendamento()}
              className="sm:hidden"
              size="icon"
              title="Novo agendamento"
              aria-label="Novo agendamento"
            >
              <Plus />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Minha conta" className="rounded-full ring-offset-background transition-opacity hover:opacity-80">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
                      {currentUser.nome.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold text-foreground">{currentUser.nome}</p>
                  <p className="text-xs text-muted-foreground font-normal">{currentUser.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/20">
                    {currentUser.perfil}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ to: "/configuracoes" })} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" /> Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/usuarios" })} className="cursor-pointer">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Gerenciar Acessos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: "/nova-senha" })} className="cursor-pointer">
                  <KeyRound className="h-4 w-4 mr-2" /> Alterar senha
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[90rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Marca() {
  return (
    <div className="flex h-[4.5rem] items-center gap-3 border-b border-sidebar-border px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ouro text-ouro-foreground">
        <GraduationCap className="h-6 w-6" />
      </div>
      <div className="leading-tight">
        <span className="block font-serif text-xl font-semibold text-white">SalaFácil</span>
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/70">Unifev</span>
      </div>
    </div>
  );
}

function ItensMenu({
  itens,
  pathname,
  naoLidas,
  onNavegar,
}: {
  itens: typeof navItems;
  pathname: string;
  naoLidas: number;
  onNavegar?: () => void;
}) {
  return itens.map((item) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.label}
        to={item.href}
        onClick={onNavegar}
        aria-current={isActive ? "page" : undefined}
        className={`relative flex items-center justify-between rounded-md px-4 py-3 text-base transition-colors ${
          isActive
            ? "bg-sidebar-accent font-bold text-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-sidebar-primary"
            : "font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-3">
          <item.icon className="h-5 w-5 shrink-0" />
          {item.label}
        </span>
        {item.hasBadge && naoLidas > 0 && (
          <Badge className="h-6 min-w-6 justify-center bg-sidebar-primary px-1.5 text-sidebar-primary-foreground hover:bg-sidebar-primary">
            {naoLidas}
          </Badge>
        )}
      </Link>
    );
  });
}
