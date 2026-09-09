import { createFileRoute } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { MapPanel } from "@/components/map/MapPanel";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useFleet } from "@/hooks/useFleet";
import { formatTime, haversineKm } from "@/lib/geo";
import { schedulesQuery, type Stop } from "@/lib/transit";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/pontos")({
  head: () => ({
    meta: [
      { title: "Pontos de parada — BUSTRAKING" },
      { name: "description", content: "Mapa e lista dos pontos de ônibus com linhas e horários." },
      { property: "og:title", content: "Pontos de parada — BUSTRAKING" },
      { property: "og:description", content: "Encontre paradas, linhas e próximos ônibus." },
    ],
  }),
  component: Pontos,
});

function Pontos() {
  const { stops, routes, live, isLoading } = useFleet();
  const schedules = useQuery(schedulesQuery);
  const { toggle, isFavorite } = useFavorites();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Stop | null>(null);

  const filtered = stops.filter((s) =>
    `${s.name} ${s.address}`.toLowerCase().includes(term.toLowerCase()),
  );

  const linesAtStop = (stop: Stop) =>
    Array.from(routes.values())
      .filter((r) => r.stops.some((s) => s.id === stop.id))
      .map((r) => r.line);

  const nextBuses = (stop: Stop) =>
    live
      .filter((b) => linesAtStop(stop).some((l) => l.id === b.lineId))
      .map((b) => ({ ...b, distance: haversineKm(b, stop) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

  const nextTimes = (stop: Stop) => {
    const now = new Date().toTimeString().slice(0, 8);
    const ids = new Set(linesAtStop(stop).map((l) => l.id));
    return (schedules.data ?? [])
      .filter((s) => ids.has(s.line_id) && s.weekday === "util" && s.departure_time >= now)
      .slice(0, 4)
      .map((s) => formatTime(s.departure_time));
  };

  return (
    <AppShell title="Pontos de parada" description="Paradas da cidade de Nova Aurora" fullBleed>
      <div className="grid flex-1 lg:grid-cols-[22rem_1fr]">
        <aside className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto border-b bg-card p-4 lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar ponto ou endereço"
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : filtered.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Nenhum ponto encontrado.
            </p>
          ) : (
            filtered.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setSelected(stop)}
                className={cn(
                  "rounded-xl border bg-card p-3 text-left text-sm transition-all hover:shadow-soft",
                  selected?.id === stop.id && "border-primary ring-2 ring-primary/20",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">{stop.address}</p>
                  </div>
                  <Star
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground",
                      isFavorite("stop", stop.id) && "fill-accent text-accent",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle.mutate({ type: "stop", itemId: stop.id, label: stop.name });
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Linhas: {linesAtStop(stop).map((l) => l.code).join(", ") || "—"}
                </p>
              </button>
            ))
          )}
        </aside>

        <div className="min-h-[60vh] p-3 lg:p-4">
          <MapPanel
            className="h-full min-h-[60vh]"
            stops={stops}
            buses={live}
            routes={Array.from(routes.values()).map((r) => ({
              id: r.line.id,
              color: r.line.color,
              points: r.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
            }))}
            focus={selected ? [selected.lat, selected.lng] : null}
            onSelectStop={setSelected}
            renderStopPopup={(stop) => (
              <div className="min-w-[15rem] space-y-1 text-sm">
                <p className="font-display text-base font-bold">{stop.name}</p>
                <p className="text-xs text-muted-foreground">{stop.address}</p>
                <p>
                  <span className="text-muted-foreground">Linhas:</span>{" "}
                  {linesAtStop(stop)
                    .map((l) => `${l.code}`)
                    .join(", ") || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Próximos ônibus:</span>{" "}
                  {nextBuses(stop)
                    .map((b) => `${b.code} (${b.etaMinutes} min)`)
                    .join(", ") || "sem ônibus por perto"}
                </p>
                <p>
                  <span className="text-muted-foreground">Horários:</span>{" "}
                  {nextTimes(stop).join(" · ") || "—"}
                </p>
              </div>
            )}
          />
        </div>
      </div>
    </AppShell>
  );
}
