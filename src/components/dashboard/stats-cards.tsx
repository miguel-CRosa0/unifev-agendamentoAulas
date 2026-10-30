import type { Indicador } from "./data";

const tom = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

export function StatsCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {indicadores.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</dd>
          <p className={`mt-2 text-xs ${tom[stat.trend as keyof typeof tom] ?? tom.neutral}`}>{stat.change}</p>
        </div>
      ))}
    </dl>
  );
}
