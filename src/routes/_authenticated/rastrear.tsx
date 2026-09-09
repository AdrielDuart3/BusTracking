import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { MapPanel } from "@/components/map/MapPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useFleet } from "@/hooks/useFleet";
import { formatRelative } from "@/lib/geo";
import type { BusTelemetry } from "@/lib/gps";
import { cn } from "@/lib/utils";

type Filtro = "todos" | "movimento" | "parados" | "proximos";

export const Route = createFileRoute("/_authenticated/rastrear")({
  validateSearch: (search: Record<string, unknown>): { q: string; filtro: Filtro } => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    filtro: (["todos", "movimento", "parados", "proximos"] as const).includes(
      search["filtro"] as Filtro,
    )
      ? (search["filtro"] as Filtro)
      : "todos",
  }),
  head: () => ({
    meta: [
      { title: "Rastrear ônibus — BUSTRAKING" },
      { name: "description", content: "Acompanhe os ônibus no mapa em tempo real." },
      { property: "og:title", content: "Rastrear ônibus — BUSTRAKING" },
      { property: "og:description", content: "Mapa ao vivo com posição, velocidade e status." },
    ],
  }),
  component: Rastrear,
});

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos os ônibus" },
  { value: "movimento", label: "Em movimento" },
  { value: "parados", label: "Parados" },
  { value: "proximos", label: "Próximos" },
];

const STATUS_EMOJI: Record<string, string> = {
  "Em movimento": "🟢",
  Parado: "🟡",
  "Fora de operação": "🔴",
};

const CENTER = { lat: -23.2015, lng: -46.5405 };

function Rastrear() {
  const { q, filtro } = Route.useSearch();
  const navigate = useNavigate();
  const { live, stops, routes, isLoading } = useFleet();
  const { toggle, isFavorite } = useFavorites();
  const [selected, setSelected] = useState<string | null>(null);
  const [term, setTerm] = useState(q);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = live;
    if (needle) {
      list = list.filter((b) =>
        [b.code, b.lineCode, b.lineName, b.destination]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    if (filtro === "movimento") list = list.filter((b) => b.status === "Em movimento");
    if (filtro === "parados") list = list.filter((b) => b.status === "Parado");
    if (filtro === "proximos")
      list = [...list]
        .sort(
          (a, b) =>
            Math.hypot(a.lat - CENTER.lat, a.lng - CENTER.lng) -
            Math.hypot(b.lat - CENTER.lat, b.lng - CENTER.lng),
        )
        .slice(0, 5);
    return list;
  }, [live, q, filtro]);

  const selectedBus = filtered.find((b) => b.id === selected) ?? null;

  const polylines = Array.from(routes.values()).map((r) => ({
    id: r.line.id,
    color: r.line.color,
    points: r.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
  }));

  return (
    <AppShell
      title="Rastrear ônibus"
      description="Posições atualizadas automaticamente a cada poucos segundos"
      fullBleed
    >
      <div className="grid flex-1 gap-0 lg:grid-cols-[22rem_1fr]">
        <aside className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto border-b bg-card p-4 lg:max-h-none lg:border-b-0 lg:border-r">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ to: "/rastrear", search: { q: term, filtro } });
            }}
          >
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ônibus, linha ou destino"
              className="pl-9"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={filtro === f.value ? "default" : "outline"}
                onClick={() => navigate({ to: "/rastrear", search: { q, filtro: f.value } })}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
              Nenhum ônibus encontrado para esta busca. Ajuste o filtro ou tente outro termo.
            </p>
          ) : (
            filtered.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                active={bus.id === selected}
                favorite={isFavorite("bus", bus.id)}
                onSelect={() => setSelected(bus.id)}
                onFavorite={() =>
                  toggle.mutate({
                    type: "bus",
                    itemId: bus.id,
                    label: `Ônibus ${bus.code} · Linha ${bus.lineCode}`,
                  })
                }
              />
            ))
          )}
        </aside>

        <div className="min-h-[60vh] p-3 lg:p-4">
          <MapPanel
            className="h-full min-h-[60vh]"
            buses={filtered}
            stops={stops}
            routes={polylines}
            focus={selectedBus ? [selectedBus.lat, selectedBus.lng] : null}
            onSelectBus={(bus) => setSelected(bus.id)}
          />
        </div>
      </div>
    </AppShell>
  );
}

function BusCard({
  bus,
  active,
  favorite,
  onSelect,
  onFavorite,
}: {
  bus: BusTelemetry;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "cursor-pointer rounded-xl border bg-card p-3 text-sm transition-all hover:shadow-soft",
        active && "border-primary ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {STATUS_EMOJI[bus.status]} Ônibus {bus.code}
          </p>
          <p className="text-xs text-muted-foreground">
            Linha {bus.lineCode} — {bus.lineName}
          </p>
        </div>
        <button
          type="button"
          aria-label="Favoritar ônibus"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className="text-muted-foreground hover:text-accent"
        >
          <Star className={cn("size-4", favorite && "fill-accent text-accent")} />
        </button>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <div>Destino: {bus.destination}</div>
        <div>Velocidade: {bus.speedKmh} km/h</div>
        <div>Próximo: {bus.nextStopName}</div>
        <div>Chega em: {bus.etaMinutes} min</div>
        <div>Distância: {bus.distanceToNextStopKm.toFixed(2)} km</div>
        <div>{formatRelative(bus.updatedAt)}</div>
      </dl>
    </div>
  );
}
