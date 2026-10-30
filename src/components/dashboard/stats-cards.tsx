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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {indicadores.map((stat) => {
        const Icon = icons[stat.label] ?? DoorOpen;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-5 w-5" />
                <p className="text-sm font-semibold">{stat.label}</p>
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <div className="mt-3 flex items-start gap-1.5 text-sm font-medium">
                {stat.trend === "up" ? (
                  <>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">{stat.change}</span>
                  </>
                ) : stat.trend === "down" ? (
                  <>
                    <ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" />
                    <span className="text-rose-700 dark:text-rose-400">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
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
