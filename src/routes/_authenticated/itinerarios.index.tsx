import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFavorites } from "@/hooks/useFavorites";
import { formatTime } from "@/lib/geo";
import { linesQuery } from "@/lib/transit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/itinerarios/")({
  head: () => ({
    meta: [
      { title: "Itinerários — BUSTRAKING" },
      { name: "description", content: "Todas as linhas, origens, destinos e frequências." },
      { property: "og:title", content: "Itinerários — BUSTRAKING" },
      { property: "og:description", content: "Consulte as linhas e seus trajetos completos." },
    ],
  }),
  component: Itinerarios,
});

function Itinerarios() {
  const lines = useQuery(linesQuery);
  const { toggle, isFavorite } = useFavorites();
  const [term, setTerm] = useState("");

  const filtered = (lines.data ?? []).filter((l) =>
    `${l.code} ${l.name} ${l.origin} ${l.destination}`.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <AppShell title="Itinerários" description="Linhas disponíveis na cidade de Nova Aurora">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por linha, nome ou destino"
          className="pl-9"
        />
      </div>

      {lines.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <p className="card-soft p-8 text-center text-sm text-muted-foreground">
          Nenhuma linha encontrada para “{term}”.
        </p>
      ) : (
        <div className="card-soft overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className="font-semibold">{line.code}</TableCell>
                  <TableCell className="whitespace-nowrap">{line.name}</TableCell>
                  <TableCell>{line.origin}</TableCell>
                  <TableCell>{line.destination}</TableCell>
                  <TableCell>{formatTime(line.start_time)}</TableCell>
                  <TableCell>{formatTime(line.end_time)}</TableCell>
                  <TableCell>{line.frequency_min} min</TableCell>
                  <TableCell>
                    <Badge variant={line.status === "Operando" ? "default" : "secondary"}>
                      {line.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Favoritar linha"
                      onClick={() =>
                        toggle.mutate({
                          type: "line",
                          itemId: line.id,
                          label: `Linha ${line.code} - ${line.name}`,
                        })
                      }
                    >
                      <Star
                        className={cn(
                          "size-4",
                          isFavorite("line", line.id) && "fill-accent text-accent",
                        )}
                      />
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/itinerarios/$lineId" params={{ lineId: line.id }}>
                        Ver itinerário
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
