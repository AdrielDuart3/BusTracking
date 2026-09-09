/**
 * Camada de consulta sobre os dados do PDF do TCA.
 * Nenhum horário é calculado ou inventado aqui — apenas filtragem e busca.
 */
import { busLines } from "./bus-lines";
import type { BusLine, Neighborhood, PeriodKey } from "./types";

export { busLines };

export const PERIODS: { value: PeriodKey; label: string; short: string }[] = [
  { value: "semana", label: "Segunda-feira a sexta-feira", short: "Segunda a sexta" },
  { value: "sabado", label: "Sábado", short: "Sábado" },
  { value: "domingo", label: "Domingo", short: "Domingo" },
  { value: "feriado", label: "Feriado", short: "Feriado" },
];

export const PDF_SOURCE =
  'Fonte: "HORÁRIOS E LINHAS DE ÔNIBUS" — Serviço Municipal de Transportes Coletivos de Araras (TCA).';

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .toLowerCase()
    .trim();
}

export function getLine(code: string | undefined | null): BusLine | undefined {
  if (!code) return undefined;
  return busLines.find((line) => line.code === code);
}

export function departuresCount(line: BusLine, period: PeriodKey): number {
  return line.schedules[period].length;
}

export function availablePeriods(line: BusLine): PeriodKey[] {
  return PERIODS.map((p) => p.value).filter((p) => departuresCount(line, p) > 0);
}

export function neighborhoodLabel(line: BusLine): string {
  return line.neighborhoods.join(" | ");
}

/** Lista única de bairros com as linhas que os atendem. */
export const neighborhoods: Neighborhood[] = (() => {
  const map = new Map<string, Neighborhood>();
  for (const line of busLines) {
    for (const name of line.neighborhoods) {
      const key = normalize(name);
      const existing = map.get(key);
      if (existing) {
        if (!existing.lineCodes.includes(line.code)) existing.lineCodes.push(line.code);
      } else {
        map.set(key, { name, lineCodes: [line.code] });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
})();

export function linesForNeighborhood(name: string): BusLine[] {
  const key = normalize(name);
  return busLines.filter((line) => line.neighborhoods.some((n) => normalize(n) === key));
}

export type LineFilters = {
  term?: string | undefined;
  lineCode?: string | undefined;
  neighborhood?: string | undefined;
  period?: PeriodKey | undefined;
};

export function filterLines({ term, lineCode, neighborhood, period }: LineFilters): BusLine[] {
  const q = term ? normalize(term) : "";
  return busLines.filter((line) => {
    if (lineCode && line.code !== lineCode) return false;
    if (neighborhood && !line.neighborhoods.some((n) => normalize(n) === normalize(neighborhood)))
      return false;
    if (period && departuresCount(line, period) === 0) return false;
    if (!q) return true;
    return (
      normalize(line.code).includes(q) ||
      line.neighborhoods.some((n) => normalize(n).includes(q))
    );
  });
}
