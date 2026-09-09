import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bus, Clock, MapPin, Search, Star } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { MapPanel } from "@/components/map/MapPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useFleet } from "@/hooks/useFleet";
import { schedulesQuery } from "@/lib/transit";
import { formatTime, haversineKm } from "@/lib/geo";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BUSTRAKING" },
      { name: "description", content: "Painel com ônibus próximos, linhas favoritas e horários." },
      { property: "og:title", content: "Dashboard — BUSTRAKING" },
      { property: "og:description", content: "Seu painel de mobilidade urbana no BUSTRAKING." },
    ],
  }),
  component: Dashboard,
});

const CENTER = { lat: -23.2015, lng: -46.5405 };

function Card({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="card-soft flex flex-col p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-primary" /> {title}
        </h2>
        {action}
      </header>
      <div className="flex-1 space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Dashboard() {
  const { profile, user } = useAuth();
  const { live, stops, routes, lines, isLoading } = useFleet();
  const { favorites } = useFavorites();
  const schedules = useQuery(schedulesQuery);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const nearbyBuses = [...live]
    .sort((a, b) => haversineKm(a, CENTER) - haversineKm(b, CENTER))
    .slice(0, 4);

  const nearbyStops = [...stops]
    .sort((a, b) => haversineKm(a, CENTER) - haversineKm(b, CENTER))
    .slice(0, 4);

  const now = new Date().toTimeString().slice(0, 8);
  const nextSchedules = (schedules.data ?? [])
    .filter((s) => s.weekday === "util" && s.departure_time >= now)
    .slice(0, 5);

  const polylines = Array.from(routes.values()).map((r) => ({
    id: r.line.id,
    color: r.line.color,
    points: r.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
  }));

  const firstName = (profile?.full_name || user?.email || "passageiro").split(" ")[0];

  return (
    <AppShell title={`Olá, ${firstName}!`} description="Resumo da sua mobilidade hoje">
      <form
        className="card-soft flex flex-col gap-3 p-4 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ to: "/rastrear", search: { q: query, filtro: "todos" } });
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Para onde você quer ir?"
            className="pl-9"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Ônibus próximos"
            icon={Bus}
            action={
              <Link to="/rastrear" search={{ q: "", filtro: "todos" }} className="text-xs text-primary hover:underline">
                ver todos
              </Link>
            }
          >
            {nearbyBuses.map((bus) => (
              <div key={bus.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                <span className="font-medium">
                  {bus.code} · {bus.lineCode}
                </span>
                <span className="text-xs text-muted-foreground">{bus.etaMinutes} min</span>
              </div>
            ))}
          </Card>

          <Card
            title="Linhas favoritas"
            icon={Star}
            action={
              <Link to="/favoritos" className="text-xs text-primary hover:underline">
                gerenciar
              </Link>
            }
          >
            {favorites.filter((f) => f.item_type === "line").length === 0 ? (
              <p className="text-muted-foreground">
                Você ainda não tem linhas favoritas. Marque uma estrela em Itinerários.
              </p>
            ) : (
              favorites
                .filter((f) => f.item_type === "line")
                .slice(0, 4)
                .map((f) => (
                  <div key={f.id} className="rounded-lg bg-muted/60 px-3 py-2 font-medium">
                    {f.label}
                  </div>
                ))
            )}
          </Card>

          <Card
            title="Próximos horários"
            icon={Clock}
            action={
              <Link to="/horarios" className="text-xs text-primary hover:underline">
                ver grade
              </Link>
            }
          >
            {nextSchedules.length === 0 ? (
              <p className="text-muted-foreground">Sem partidas restantes para hoje.</p>
            ) : (
              nextSchedules.map((s) => {
                const line = lines.find((l) => l.id === s.line_id);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span className="font-medium">{formatTime(s.departure_time)}</span>
                    <span className="text-xs text-muted-foreground">
                      Linha {line?.code} · {s.direction}
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          <Card
            title="Pontos próximos"
            icon={MapPin}
            action={
              <Link to="/pontos" className="text-xs text-primary hover:underline">
                ver mapa
              </Link>
            }
          >
            {nearbyStops.map((stop) => (
              <div key={stop.id} className="rounded-lg bg-muted/60 px-3 py-2">
                <p className="font-medium">{stop.name}</p>
                <p className="text-xs text-muted-foreground">
                  {haversineKm(stop, CENTER).toFixed(2)} km
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Ônibus próximos no mapa</h2>
        <MapPanel className="h-80" buses={live} stops={stops} routes={polylines} />
      </section>
    </AppShell>
  );
}
