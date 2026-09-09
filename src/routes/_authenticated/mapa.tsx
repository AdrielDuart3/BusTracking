import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock, Info } from "lucide-react";
import { useMemo } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { MapPanel } from "@/components/map/MapPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ARARAS_CENTER,
  colorForLine,
  demoRoutes,
  demoStopsForLine,
  terminalStop,
} from "@/data/demo-routes";
import { PDF_SOURCE, PERIODS, busLines, getLine, neighborhoods } from "@/data/tca";
import type { BusStopRef } from "@/data/types";
import type { Stop } from "@/lib/transit";

const ALL = "todas";

type MapaSearch = { linha?: string | undefined; bairro?: string | undefined };

export const Route = createFileRoute("/_authenticated/mapa")({
  validateSearch: (search: Record<string, unknown>): MapaSearch => ({
    linha: typeof search['linha'] === "string" ? search['linha'] : undefined,
    bairro: typeof search['bairro'] === "string" ? search['bairro'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mapa e rotas das linhas de Araras — BUSTRAKING" },
      {
        name: "description",
        content:
          "Visualize no mapa as linhas de ônibus de Araras e os bairros atendidos, com traçados demonstrativos enquanto os itinerários oficiais não estão disponíveis.",
      },
      { property: "og:title", content: "Mapa e rotas — BUSTRAKING" },
      {
        property: "og:description",
        content: "Linhas, bairros atendidos e traçados demonstrativos no mapa de Araras.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mapa,
});

function toStop(ref: BusStopRef): Stop {
  return {
    id: ref.id,
    code: ref.code,
    name: ref.name,
    address: ref.address,
    lat: ref.lat,
    lng: ref.lng,
  } as Stop;
}

function Mapa() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const selected = getLine(search.linha);

  const lines = useMemo(
    () =>
      search.bairro
        ? busLines.filter((l) => l.neighborhoods.includes(search.bairro!))
        : busLines,
    [search.bairro],
  );

  const routes = useMemo(() => {
    const visible = selected
      ? demoRoutes.filter((r) => r.lineCode === selected.code)
      : demoRoutes.filter((r) => lines.some((l) => l.code === r.lineCode));
    return visible.map((r) => ({ id: r.lineCode, color: r.color, points: r.points }));
  }, [selected, lines]);

  const stops = useMemo(
    () => (selected ? demoStopsForLine(selected.code).map(toStop) : [toStop(terminalStop)]),
    [selected],
  );

  const setSearch = (patch: Partial<MapaSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <AppShell title="Mapa e rotas" description="Linhas e bairros atendidos em Araras">
      <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>Rotas demonstrativas.</strong> Os horários e bairros são oficiais (PDF do TCA),
          mas os traçados e pontos exibidos no mapa são ilustrativos, pois os itinerários oficiais
          com coordenadas ainda não estão disponíveis.
        </p>
      </div>

      <div className="card-soft grid gap-3 p-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Linha</label>
          <Select
            value={search.linha ?? ALL}
            onValueChange={(v) => setSearch({ linha: v === ALL ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as linhas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as linhas</SelectItem>
              {busLines.map((line) => (
                <SelectItem key={line.code} value={line.code}>
                  {line.code} — {line.neighborhoods.join(" | ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Bairro</label>
          <Select
            value={search.bairro ?? ALL}
            onValueChange={(v) => setSearch({ bairro: v === ALL ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os bairros</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n.name} value={n.name}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <MapPanel
          className="h-[60vh] min-h-[24rem]"
          center={ARARAS_CENTER}
          zoom={13}
          routes={routes}
          stops={stops}
        />

        <aside className="card-soft flex max-h-[60vh] flex-col overflow-y-auto p-4">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-11 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: colorForLine(selected.code) }}
                >
                  {selected.code}
                </span>
                <div>
                  <p className="font-display font-bold">{selected.neighborhoods.join(" | ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.neighborhoods.length} bairro(s) atendido(s)
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm">
                {PERIODS.map((p) => (
                  <li key={p.value} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{p.short}</span>
                    <span className="font-semibold tabular-nums">
                      {selected.schedules[p.value].length} partidas
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link to="/horarios" search={{ linha: selected.code }}>
                  <CalendarClock className="size-4" /> Ver horários da linha
                </Link>
              </Button>
              <Badge variant="secondary">Traçado demonstrativo</Badge>
            </div>
          ) : lines.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma linha encontrada para esse bairro.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {lines.length} linha(s). Selecione uma para ver o traçado e os horários.
              </p>
              {lines.map((line) => (
                <button
                  key={line.code}
                  type="button"
                  onClick={() => setSearch({ linha: line.code })}
                  className="flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors hover:bg-accent"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: colorForLine(line.code) }}
                  >
                    {line.code}
                  </span>
                  <span className="min-w-0 truncate text-sm">
                    {line.neighborhoods.join(" | ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      <p className="text-xs text-muted-foreground">{PDF_SOURCE}</p>
    </AppShell>
  );
}
