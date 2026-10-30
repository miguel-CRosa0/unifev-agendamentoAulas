import { useLayoutEffect, useState } from "react";

import type { Indicador } from "./data";

const tom = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

// Conta de 0 até o número do indicador (ex.: "12", "75%"); outros textos aparecem direto
function Contagem({ valor }: { valor: string }) {
  const partes = /^(\D*)(\d+)(.*)$/.exec(valor);
  const alvo = partes ? Number(partes[2]) : 0;
  const [atual, setAtual] = useState(alvo);

  useLayoutEffect(() => {
    if (!partes || alvo === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duracao = 700;
    const inicio = performance.now();
    let quadro = 0;
    setAtual(0);
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      setAtual(Math.round(alvo * (1 - Math.pow(1 - t, 3))));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor]);

  if (!partes) return <>{valor}</>;
  return (
    <>
      {partes[1]}
      {atual}
      {partes[3]}
    </>
  );
}

export function StatsCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {indicadores.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            <Contagem valor={stat.value} />
          </dd>
          <p className={`mt-2 text-xs ${tom[stat.trend as keyof typeof tom] ?? tom.neutral}`}>{stat.change}</p>
        </div>
      ))}
    </dl>
  );
}
