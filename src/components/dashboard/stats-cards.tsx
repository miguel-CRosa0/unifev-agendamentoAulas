import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarCheck, DoorOpen, PieChart } from "lucide-react";

import type { Indicador } from "./data";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Salas e laboratórios": DoorOpen,
  "Agendamentos de hoje": CalendarCheck,
  "Conflitos de horário": AlertTriangle,
  "Taxa de ocupação": PieChart,
};

// Indicadores em formato de ficha: uma lista com divisórias, números em serifa
export function StatsCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <section aria-label="Indicadores" className="rounded-lg border border-border bg-card">
      <ul className="divide-y divide-border">
        {indicadores.map((stat) => {
          const Icon = icons[stat.label] ?? DoorOpen;
          return (
            <li key={stat.label} className="flex items-center gap-4 px-5 py-4">
              <Icon className="h-6 w-6 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground">{stat.label}</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  ) : stat.trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" />
                  ) : null}
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : stat.trend === "down"
                          ? "font-semibold text-rose-700 dark:text-rose-400"
                          : undefined
                    }
                  >
                    {stat.change}
                  </span>
                </p>
              </div>
              <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
                {stat.value.replace(/^0(?=\d)/, "")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
