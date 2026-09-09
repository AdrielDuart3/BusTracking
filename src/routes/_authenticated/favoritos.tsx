import { Link, createFileRoute } from "@tanstack/react-router";
import { Bus, MapPin, Route as RouteIcon, Star, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites, type Favorite } from "@/hooks/useFavorites";
import { useFleet } from "@/hooks/useFleet";
import { formatTime } from "@/lib/geo";
import { schedulesQuery } from "@/lib/transit";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — BUSTRAKING" },
      { name: "description", content: "Suas linhas, ônibus e pontos de parada salvos." },
      { property: "og:title", content: "Favoritos — BUSTRAKING" },
      { property: "og:description", content: "Acesse rapidamente o que você mais usa." },
    ],
  }),
  component: Favoritos,
});

const ICONS = { line: RouteIcon, bus: Bus, stop: MapPin };
const LABELS = { line: "Linha", bus: "Ônibus", stop: "Ponto de parada" };

function Favoritos() {
  const { favorites, isLoading, remove } = useFavorites();
  const { live, lines, stops } = useFleet();
  const schedules = useQuery(schedulesQuery);

  function details(fav: Favorite) {
    const now = new Date().toTimeString().slice(0, 8);
    if (fav.item_type === "line") {
      const next = (schedules.data ?? []).find(
        (s) => s.line_id === fav.item_id && s.weekday === "util" && s.departure_time >= now,
      );
      const bus = live.find((b) => b.lineId === fav.item_id);
      return [
        { label: "Próximo ônibus", value: next ? formatTime(next.departure_time) : "—" },
        { label: "Previsão", value: bus ? `${bus.etaMinutes} minutos` : "—" },
      ];
    }
    if (fav.item_type === "bus") {
      const bus = live.find((b) => b.id === fav.item_id);
      return [
        { label: "Status", value: bus?.status ?? "—" },
        { label: "Previsão", value: bus ? `${bus.etaMinutes} minutos` : "—" },
      ];
    }
    const stop = stops.find((s) => s.id === fav.item_id);
    const linesAt = lines.filter(() => false);
    return [
      { label: "Endereço", value: stop?.address ?? "—" },
      { label: "Linhas", value: linesAt.map((l) => l.code).join(", ") || "ver no mapa" },
    ];
  }

  return (
    <AppShell title="Favoritos" description="Linhas, ônibus e pontos salvos por você">
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-12 text-center">
          <Star className="size-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Nenhum favorito ainda</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Toque na estrela em uma linha, ônibus ou ponto de parada para salvá-lo aqui.
          </p>
          <Button asChild>
            <Link to="/itinerarios">Explorar itinerários</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav) => {
            const Icon = ICONS[fav.item_type];
            return (
              <article key={fav.id} className="card-soft flex flex-col gap-3 p-5">
                <header className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {LABELS[fav.item_type]}
                      </p>
                      <h2 className="font-semibold">⭐ {fav.label}</h2>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Remover dos favoritos">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover dos favoritos?</AlertDialogTitle>
                        <AlertDialogDescription>
                          “{fav.label}” deixará de aparecer nesta lista. Você poderá favoritá-lo
                          novamente quando quiser.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(fav.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </header>
                <dl className="space-y-1 text-sm">
                  {details(fav).map((d) => (
                    <div key={d.label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd className="text-right font-medium">{d.value}</dd>
                    </div>
                  ))}
                </dl>
                {fav.item_type === "line" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/itinerarios/$lineId" params={{ lineId: fav.item_id }}>
                      Ver itinerário
                    </Link>
                  </Button>
                ) : fav.item_type === "bus" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/rastrear" search={{ q: "", filtro: "todos" }}>
                      Ver no mapa
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/pontos">Ver no mapa</Link>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
