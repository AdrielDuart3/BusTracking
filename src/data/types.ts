/**
 * Tipos do domínio de transporte público de Araras-SP.
 *
 * Os horários e bairros vêm do PDF oficial do TCA (ver src/data/bus-lines.ts).
 * As geometrias de rota são demonstrativas e ficam separadas dos dados oficiais
 * (ver src/data/demo-routes.ts), para que possam ser substituídas por GeoJSON
 * ou coordenadas reais sem alterar o restante do sistema.
 */

/** Períodos exatamente como aparecem no PDF. */
export type PeriodKey = "semana" | "sabado" | "domingo" | "feriado";

/** Uma partida: saída do terminal e/ou saída do bairro, conforme a fonte. */
export type Departure = {
  /** Horário de saída do terminal (null quando o PDF não traz valor). */
  terminal: string | null;
  /** Horário de saída do bairro (null quando o PDF não traz valor). */
  bairro: string | null;
};

export type Schedule = Record<PeriodKey, Departure[]>;

export type BusLine = {
  /** Código da linha, ex.: "0701". */
  code: string;
  /** Bairros atendidos, na ordem impressa no PDF. */
  neighborhoods: string[];
  /** Página do PDF de origem (rastreabilidade da fonte). */
  page: number;
  schedules: Schedule;
  /** Períodos em que o PDF indica "RECOLHE" após o último horário. */
  recolhe: PeriodKey[];
};

export type Neighborhood = {
  name: string;
  /** Códigos das linhas que atendem o bairro. */
  lineCodes: string[];
};

export type LatLngPoint = { lat: number; lng: number };

/** Traçado de uma linha. `demo: true` = dado ilustrativo, não oficial. */
export type LineRoute = {
  lineCode: string;
  color: string;
  points: LatLngPoint[];
  demo: boolean;
};

export type BusStopRef = {
  id: string;
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** true quando a posição é aproximada/demonstrativa. */
  demo: boolean;
};
