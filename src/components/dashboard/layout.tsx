import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { useStore } from "@/context/store-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  { icon: Users, label: "Usuários e acessos", href: "/usuarios" },
  { icon: FileBarChart, label: "Relatórios", href: "/relatorios" },
  { icon: MessageSquare, label: "Notificações", href: "/notificacoes", hasBadge: true },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const {
    currentUser,
    usuarios,
    switchUser,
    openNovoAgendamento,
    unreadNotificacoesCount,
  } = useStore();

  const handleLogout = () => {
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Search dialog accessible globally */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NovoAgendamentoDialog />

      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">SalaFácil</span>
          <Badge variant="outline" className="ml-auto text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5">
            v2.0
          </Badge>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {item.hasBadge && unreadNotificacoesCount > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground">
                    {unreadNotificacoesCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card Bottom Sidebar */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full text-left flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.nome}`} alt={currentUser.nome} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentUser.nome.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{currentUser.nome}</span>
                  <span className="truncate text-xs text-muted-foreground">{currentUser.perfil}</span>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Alternar Perfil Ativo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {usuarios.map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-medium">{u.nome}</span>
                  <span className="text-[10px] text-muted-foreground">({u.perfil})</span>
                  {u.id === currentUser.id && <UserCheck className="h-3 w-3 text-primary ml-1" />}
                </DropdownMenuItem>
              ))}
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
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">SalaFácil</span>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {item.hasBadge && unreadNotificacoesCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground">
                        {unreadNotificacoesCount}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search Trigger */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar salas, turmas, professores... (Ctrl+K)"
              className="pl-9 bg-background border-border text-sm cursor-pointer"
              onClick={() => setSearchOpen(true)}
              onFocus={() => setSearchOpen(true)}
              readOnly
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link to="/notificacoes" className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadNotificacoesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>

            <Button
              onClick={() => openNovoAgendamento()}
              className="hidden sm:inline-flex items-center gap-1.5 font-medium shadow-sm"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
            <Button
              onClick={() => openNovoAgendamento()}
              className="sm:hidden"
              size="icon"
              title="Novo agendamento"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="rounded-full ring-offset-background transition-opacity hover:opacity-80">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.nome}`} alt={currentUser.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.nome.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold text-foreground">{currentUser.nome}</p>
                  <p className="text-xs text-muted-foreground font-normal">{currentUser.email}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] text-primary border-primary/20">
                    {currentUser.perfil}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/configuracoes" })} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/usuarios" })} className="cursor-pointer">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Gerenciar Acessos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
