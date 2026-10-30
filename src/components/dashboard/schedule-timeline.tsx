import { Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScheduleTimeline({ agenda }: { agenda: { time: string; itens: string[] }[] }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Agenda do dia</CardTitle>
        <p className="text-sm text-muted-foreground">Grade por horário de aula</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {agenda.map((slot, index) => (
            <div key={slot.time} className="relative flex gap-4">
              {index !== agenda.length - 1 && (
                <div className="absolute left-[19px] top-8 h-full w-px bg-border" />
              )}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 pb-6">
                <span className="text-sm font-semibold text-foreground">{slot.time}</span>
                {slot.itens.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">Horário livre</p>
                ) : (
                  <div className="mt-1 space-y-1.5">
                    {slot.itens.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
