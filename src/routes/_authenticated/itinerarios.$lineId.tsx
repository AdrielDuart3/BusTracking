import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { MapPanel } from "@/components/map/MapPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleet } from "@/hooks/useFleet";
import { formatTime } from "@/lib/geo";
import { schedulesQuery } from "@/lib/transit";

export const Route = createFileRoute("/_authenticated/itinerarios/$lineId")({
  head: () => ({
    meta: [
      { title: "Itinerário da linha — BUSTRAKING" },
      { name: "description", content: "Rota, pontos de parada e horários da linha selecionada." },
      { property: "og:title", content: "Itinerário da linha — BUSTRAKING" },
      { property: "og:description", content: "Veja o trajeto completo e o tempo estimado." },
    ],
  }),
  component: LineDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-sm text-destructive">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm">Linha não encontrada.</div>,
});

function LineDetail() {
  const { lineId } = Route.useParams();
  const { routes, live, isLoading } = useFleet();
  const schedules = useQuery(schedulesQuery);

  const route = routes.get(lineId);
  const lineSchedules = (schedules.data ?? []).filter(
    (s) => s.line_id === lineId && s.weekday === "util",
  );

  if (isLoading || !route) {
    return (
      <AppShell title="Itinerário" description="Carregando dados da linha">
        <Skeleton className="h-96 rounded-2xl" />
      </AppShell>
    );
  }

  const { line, stops } = route;
  const buses = live.filter((b) => b.lineId === lineId);

  return (
    <AppShell title={`Linha ${line.code} — ${line.name}`} description={`${line.origin} ⇄ ${line.destination}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/itinerarios">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </Button>
        <Badge variant={line.status === "Operando" ? "default" : "secondary"}>{line.status}</Badge>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Timer className="size-4" /> {line.estimated_minutes} min de viagem
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" /> {formatTime(line.start_time)} às {formatTime(line.end_time)}{" "}
          · a cada {line.frequency_min} min
        </span>
      </div>

      <MapPanel
        className="h-96"
        buses={buses}
        stops={stops}
        routes={[
          {
            id: line.id,
            color: line.color,
            points: stops.map((s) => ({ lat: s.lat, lng: s.lng })),
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-soft p-5">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 text-primary" /> Pontos de parada (sentido ida)
          </h2>
          <ol className="space-y-3">
            {stops.map((stop, index) => (
              <li key={`${stop.id}-${index}`} className="flex gap-3">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{stop.name}</p>
                  <p className="text-xs text-muted-foreground">{stop.address}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card-soft p-5">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4 text-primary" /> Horários (dias úteis)
          </h2>
          <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {lineSchedules.map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-muted/70 px-2 py-1.5 text-center text-xs font-medium"
                title={`Sentido ${s.direction}`}
              >
                {formatTime(s.departure_time)}
              </span>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/horarios">Ver grade completa</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
