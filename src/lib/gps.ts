import { haversineKm, interpolate, type LatLng } from "./geo";
import type { Bus, Line, Stop } from "./transit";

/**
 * GPS provider abstraction.
 *
 * The app never talks to the simulator directly — it consumes `GpsProvider`.
 * To plug a real fleet API later, implement this same interface (websocket or
 * polling) and swap the instance created in `useFleet`.
 */
export type BusTelemetry = {
  id: string;
  code: string;
  lineId: string;
  lineCode: string;
  lineName: string;
  lineColor: string;
  destination: string;
  status: "Em movimento" | "Parado" | "Fora de operação";
  speedKmh: number;
  lat: number;
  lng: number;
  updatedAt: string;
  nextStopName: string;
  distanceToNextStopKm: number;
  etaMinutes: number;
};

export type GpsProvider = {
  snapshot(): BusTelemetry[];
  subscribe(listener: (buses: BusTelemetry[]) => void): () => void;
  stop(): void;
};

type RouteInfo = { line: Line; stops: Stop[] };

type Runtime = {
  telemetry: BusTelemetry;
  route: Stop[];
  segment: number;
  progress: number;
  forward: boolean;
};

const TICK_MS = 2000;

export function createSimulatedGpsProvider(
  buses: Bus[],
  routes: Map<string, RouteInfo>,
): GpsProvider {
  const listeners = new Set<(buses: BusTelemetry[]) => void>();

  const runtimes: Runtime[] = buses.map((bus) => {
    const route = routes.get(bus.line_id);
    const stops = route?.stops ?? [];
    const line = route?.line;
    const segment = nearestSegment(bus, stops);
    return {
      route: stops,
      segment,
      progress: 0,
      forward: true,
      telemetry: {
        id: bus.id,
        code: bus.code,
        lineId: bus.line_id,
        lineCode: line?.code ?? "—",
        lineName: line?.name ?? "Linha",
        lineColor: line?.color ?? "#1d4ed8",
        destination: bus.destination,
        status: bus.status as BusTelemetry["status"],
        speedKmh: bus.speed_kmh,
        lat: bus.lat,
        lng: bus.lng,
        updatedAt: new Date().toISOString(),
        nextStopName: stops[Math.min(segment + 1, stops.length - 1)]?.name ?? "—",
        distanceToNextStopKm: 0,
        etaMinutes: 0,
      },
    };
  });

  function tick() {
    for (const rt of runtimes) {
      if (rt.telemetry.status === "Fora de operação" || rt.route.length < 2) continue;

      if (rt.telemetry.status === "Parado") {
        // 25% chance of departing again on each tick
        if (Math.random() < 0.25) {
          rt.telemetry.status = "Em movimento";
          rt.telemetry.speedKmh = 22 + Math.round(Math.random() * 25);
        }
      } else {
        // small chance of stopping at a bus stop
        if (Math.random() < 0.05) {
          rt.telemetry.status = "Parado";
          rt.telemetry.speedKmh = 0;
        } else {
          rt.telemetry.speedKmh = Math.max(
            12,
            Math.min(58, rt.telemetry.speedKmh + Math.round((Math.random() - 0.5) * 10)),
          );
        }
      }

      if (rt.telemetry.status === "Em movimento") {
        const from = rt.route[rt.segment]!;
        const to = rt.route[rt.segment + 1] ?? rt.route[rt.segment]!;
        const segmentKm = Math.max(0.05, haversineKm(from, to));
        const travelledKm = (rt.telemetry.speedKmh * TICK_MS) / 3_600_000;
        rt.progress += travelledKm / segmentKm;
        while (rt.progress >= 1) {
          rt.progress -= 1;
          rt.segment += rt.forward ? 1 : -1;
          if (rt.segment >= rt.route.length - 1) {
            rt.segment = rt.route.length - 2;
            rt.forward = false;
          } else if (rt.segment < 0) {
            rt.segment = 0;
            rt.forward = true;
          }
        }
        const pos: LatLng = interpolate(
          rt.route[rt.segment]!,
          rt.route[rt.segment + 1] ?? rt.route[rt.segment]!,
          rt.forward ? rt.progress : 1 - rt.progress,
        );
        rt.telemetry.lat = pos.lat;
        rt.telemetry.lng = pos.lng;
      }

      const nextStop =
        rt.route[rt.forward ? Math.min(rt.segment + 1, rt.route.length - 1) : rt.segment]!;
      rt.telemetry.nextStopName = nextStop.name;
      rt.telemetry.distanceToNextStopKm = haversineKm(rt.telemetry, nextStop);
      rt.telemetry.etaMinutes = Math.max(
        1,
        Math.round((rt.telemetry.distanceToNextStopKm / Math.max(10, rt.telemetry.speedKmh)) * 60),
      );
      rt.telemetry.updatedAt = new Date().toISOString();
    }

    const snapshot = runtimes.map((rt) => ({ ...rt.telemetry }));
    listeners.forEach((listener) => listener(snapshot));
  }

  const timer = setInterval(tick, TICK_MS);
  tick();

  return {
    snapshot: () => runtimes.map((rt) => ({ ...rt.telemetry })),
    subscribe(listener) {
      listeners.add(listener);
      listener(runtimes.map((rt) => ({ ...rt.telemetry })));
      return () => listeners.delete(listener);
    },
    stop() {
      clearInterval(timer);
      listeners.clear();
    },
  };
}

function nearestSegment(bus: LatLng, stops: Stop[]): number {
  if (stops.length < 2) return 0;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < stops.length - 1; i += 1) {
    const d = haversineKm(bus, stops[i]!);
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
}
