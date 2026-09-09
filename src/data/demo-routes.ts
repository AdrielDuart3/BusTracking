/**
 * DADOS DE DEMONSTRAÇÃO.
 *
 * O PDF do TCA traz horários e bairros, mas não traz coordenadas das rotas.
 * Os traçados abaixo são gerados de forma sintética a partir do centro de
 * Araras apenas para demonstrar a interface do mapa. Não representam o
 * itinerário oficial de nenhuma linha.
 *
 * Para usar dados reais: substituir `demoRoutes` por rotas com `demo: false`
 * (ou carregar GeoJSON/API) mantendo o mesmo formato `LineRoute`.
 */
import { busLines } from "./bus-lines";
import type { BusStopRef, LineRoute } from "./types";

/** Referência de centro de Araras-SP (posição aproximada, uso demonstrativo). */
export const ARARAS_CENTER: [number, number] = [-22.3572, -47.3844];

export const LINE_COLORS = [
  "#1d4ed8",
  "#0891b2",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#db2777",
  "#0f766e",
  "#b45309",
];

export function colorForLine(code: string): string {
  const index = busLines.findIndex((l) => l.code === code);
  return LINE_COLORS[(index < 0 ? 0 : index) % LINE_COLORS.length]!;
}

/** Terminal municipal — ponto de referência; posição aproximada (demonstração). */
export const terminalStop: BusStopRef = {
  id: "terminal",
  code: "TERM",
  name: "Terminal Municipal",
  address: "Araras-SP — posição aproximada (dados de demonstração)",
  lat: ARARAS_CENTER[0],
  lng: ARARAS_CENTER[1],
  demo: true,
};

/** Traçado radial sintético: terminal -> bairro -> volta. */
export const demoRoutes: LineRoute[] = busLines.map((line, index) => {
  const angle = (index / busLines.length) * Math.PI * 2;
  const [lat, lng] = ARARAS_CENTER;
  const points = [0.2, 0.45, 0.7, 1].map((step) => ({
    lat: lat + Math.sin(angle) * 0.035 * step,
    lng: lng + Math.cos(angle) * 0.045 * step,
  }));
  return {
    lineCode: line.code,
    color: colorForLine(line.code),
    points: [{ lat, lng }, ...points],
    demo: true,
  };
});

/** Pontos ilustrativos ao longo de cada rota demonstrativa. */
export function demoStopsForLine(lineCode: string): BusStopRef[] {
  const route = demoRoutes.find((r) => r.lineCode === lineCode);
  const line = busLines.find((l) => l.code === lineCode);
  if (!route || !line) return [terminalStop];
  const stops = route.points.slice(1).map((point, i) => ({
    id: `${lineCode}-demo-${i}`,
    code: `${lineCode}-${i + 1}`,
    name: line.neighborhoods[i] ?? `Ponto ilustrativo ${i + 1}`,
    address: "Ponto de demonstração — coordenada não oficial",
    lat: point.lat,
    lng: point.lng,
    demo: true,
  }));
  return [terminalStop, ...stops];
}
