import { useState } from "react";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  FileBarChart,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  KeyRound,
  Users,
} from "lucide-react";

import { useStore } from "@/context/store-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearchDialog } from "@/components/dashboard/global-search-dialog";
import { NovoAgendamentoDialog } from "@/components/dashboard/novo-agendamento-dialog";

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1]![0]! : "")).toUpperCase();
}

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

export function Marca({ escura = false }: { escura?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <rect x="2" y="2" width="9" height="9" rx="1.5" className={escura ? "fill-sidebar-primary" : "fill-primary"} />
        <rect x="13" y="2" width="9" height="9" rx="1.5" className="fill-current opacity-25" />
        <rect x="2" y="13" width="9" height="9" rx="1.5" className="fill-current opacity-25" />
        <rect x="13" y="13" width="9" height="9" rx="1.5" className="fill-current opacity-60" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">SalaFácil</span>
    </div>
  );
}

function ItemMenu({
  item,
  ativo,
  naoLidas,
  onClick,
}: {
  item: (typeof navItems)[number];
  ativo: boolean;
  naoLidas: number;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
        ativo
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <item.icon className={`h-4 w-4 ${ativo ? "text-sidebar-primary" : ""}`} strokeWidth={1.75} />
        {item.label}
      </span>
      {item.hasBadge && naoLidas > 0 && (
        <span className="rounded-full bg-sidebar-primary px-2 text-[11px] font-medium text-sidebar-primary-foreground">
          {naoLidas}
        </span>
      )}
    </Link>
  );
}

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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center px-6 text-sidebar-accent-foreground">
          <Marca escura />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
          {itensMenu.map((item) => (
            <ItemMenu key={item.label} item={item} ativo={pathname === item.href} naoLidas={unreadNotificacoesCount} />
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                  {iniciais(currentUser.nome)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{currentUser.nome}</span>
                  <span className="truncate text-xs capitalize text-sidebar-foreground/60">{currentUser.perfil}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuLabel className="text-xs">
                <p className="font-semibold text-foreground">{currentUser.nome}</p>
                <p className="font-normal text-muted-foreground">
                  {currentUser.ra ? `RA ${currentUser.ra}` : currentUser.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/nova-senha" })} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" /> Alterar senha
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sair do sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <div className="flex h-16 items-center px-6 text-sidebar-accent-foreground">
                <Marca escura />
              </div>
              <nav className="flex flex-col gap-0.5 px-3 py-3">
                {itensMenu.map((item) => (
                  <ItemMenu
                    key={item.label}
                    item={item}
                    ativo={pathname === item.href}
                    naoLidas={unreadNotificacoesCount}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg bg-muted px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 truncate">Buscar sala, turma ou professor</span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/notificacoes"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificacoesCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </Link>

            <Button onClick={() => openNovoAgendamento()} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo agendamento</span>
              <span className="sm:hidden sr-only">Novo agendamento</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 sm:p-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
