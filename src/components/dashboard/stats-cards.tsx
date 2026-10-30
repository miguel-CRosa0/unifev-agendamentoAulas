import type { Indicador } from "./data";

const tom = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

export function StatsCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-4">
      {indicadores.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-5 py-4 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} border-border`}
        >
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="mt-1.5 font-mono text-[28px] font-medium leading-none tracking-tight text-foreground">
            {stat.value}
          </dd>
          <p className={`mt-2 text-xs ${tom[stat.trend as keyof typeof tom] ?? tom.neutral}`}>{stat.change}</p>
        </div>
      ))}
    </dl>
  );
}
