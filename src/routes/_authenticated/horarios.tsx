import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bus, Map as MapIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { colorForLine } from "@/data/demo-routes";
import {
  PDF_SOURCE,
  PERIODS,
  busLines,
  filterLines,
  getLine,
  neighborhoods,
} from "@/data/tca";
import type { PeriodKey } from "@/data/types";

const ALL = "todos";

type HorariosSearch = {
  linha?: string | undefined;
  bairro?: string | undefined;
  periodo?: PeriodKey | undefined;
};

export const Route = createFileRoute("/_authenticated/horarios")({
  validateSearch: (search: Record<string, unknown>): HorariosSearch => ({
    linha: typeof search['linha'] === "string" ? search['linha'] : undefined,
    bairro: typeof search['bairro'] === "string" ? search['bairro'] : undefined,
    periodo: PERIODS.some((p) => p.value === search['periodo'])
      ? (search['periodo'] as PeriodKey)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Horários de ônibus de Araras — BUSTRAKING" },
      {
        name: "description",
        content:
          "Consulte os horários oficiais das 24 linhas de ônibus de Araras por linha, bairro e dia (segunda a sexta, sábado, domingo e feriado).",
      },
      { property: "og:title", content: "Horários de ônibus de Araras — BUSTRAKING" },
      {
        property: "og:description",
        content: "Horários oficiais do TCA por linha, bairro e dia da semana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Horarios,
});

function Horarios() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState("");

  const period: PeriodKey = search.periodo ?? "semana";
  const selectedLine = getLine(search.linha);

  const results = useMemo(
    () =>
      filterLines({
        term,
        lineCode: search.linha,
        neighborhood: search.bairro,
      }),
    [term, search.linha, search.bairro],
  );

  const setSearch = (patch: Partial<HorariosSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <AppShell
      title="Horários"
      description="Horários oficiais das linhas de ônibus de Araras"
    >
      <div className="card-soft grid gap-3 p-4 md:grid-cols-3">
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Pesquisar linha ou bairro
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ex.: 0701 ou São João"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setSearch({ periodo: v as PeriodKey })}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.short}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {results.length === 0 ? (
        <p className="card-soft p-8 text-center text-sm text-muted-foreground">
          Nenhuma linha encontrada para esses filtros. Tente outro bairro ou limpe a pesquisa.
        </p>
      ) : (
        <div className="grid gap-4">
          {results.map((line) => {
            const departures = line.schedules[period];
            const recolhe = line.recolhe.includes(period);
            const isSelected = selectedLine?.code === line.code;
            return (
              <section key={line.code} className="card-soft overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 place-items-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: colorForLine(line.code) }}
                    >
                      {line.code}
                    </span>
                    <div>
                      <p className="font-display text-base font-bold">
                        {line.neighborhoods.join(" | ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {departures.length} partida(s) — {PERIODS.find((p) => p.value === period)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {recolhe ? <Badge variant="secondary">Recolhe</Badge> : null}
                    <Button asChild size="sm" variant="outline">
                      <Link to="/mapa" search={{ linha: line.code }}>
                        <MapIcon className="size-4" /> Ver no mapa
                      </Link>
                    </Button>
                    {!isSelected ? (
                      <Button size="sm" variant="ghost" onClick={() => setSearch({ linha: line.code })}>
                        <Bus className="size-4" /> Focar linha
                      </Button>
                    ) : null}
                  </div>
                </header>

                {departures.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Esta linha não possui horários para {PERIODS.find((p) => p.value === period)?.short}.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          <TableHead>Saída do terminal</TableHead>
                          <TableHead>Saída do bairro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departures.map((d, i) => (
                          <TableRow key={`${line.code}-${period}-${i}`}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-semibold tabular-nums">
                              {d.terminal ?? "—"}
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums">
                              {d.bairro ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{PDF_SOURCE}</p>
    </AppShell>
  );
}
