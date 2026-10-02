import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarCheck, DoorOpen, Minus, PieChart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Indicador } from "./data";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Salas e laboratórios": DoorOpen,
  "Agendamentos de hoje": CalendarCheck,
  "Conflitos de horário": AlertTriangle,
  "Taxa de ocupação": PieChart,
};

export function StatsCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {indicadores.map((stat) => {
        const Icon = icons[stat.label] ?? DoorOpen;
        return (
          <Card key={stat.label} className="border-border bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                {stat.trend === "up" ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                  </>
                ) : stat.trend === "down" ? (
                  <>
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="text-rose-600 dark:text-rose-400">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{stat.change}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
