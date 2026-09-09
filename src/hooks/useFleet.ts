import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { createSimulatedGpsProvider, type BusTelemetry } from "@/lib/gps";
import {
  busesQuery,
  lineStopsQuery,
  linesQuery,
  stopsQuery,
  type Line,
  type Stop,
} from "@/lib/transit";

export type RouteShape = { line: Line; stops: Stop[] };

export function useTransitData() {
  const lines = useQuery(linesQuery);
  const stops = useQuery(stopsQuery);
  const lineStops = useQuery(lineStopsQuery);
  const buses = useQuery(busesQuery);

  const routes = useMemo(() => {
    const map = new Map<string, RouteShape>();
    if (!lines.data || !stops.data || !lineStops.data) return map;
    const stopById = new Map(stops.data.map((s) => [s.id, s]));
    for (const line of lines.data) {
      const ordered = lineStops.data
        .filter((ls) => ls.line_id === line.id)
        .sort((a, b) => a.position - b.position)
        .map((ls) => stopById.get(ls.stop_id))
        .filter((s): s is Stop => Boolean(s));
      map.set(line.id, { line, stops: ordered });
    }
    return map;
  }, [lines.data, stops.data, lineStops.data]);

  return {
    lines: lines.data ?? [],
    stops: stops.data ?? [],
    buses: buses.data ?? [],
    routes,
    isLoading: lines.isLoading || stops.isLoading || lineStops.isLoading || buses.isLoading,
    error: lines.error ?? stops.error ?? lineStops.error ?? buses.error,
  };
}

/** Live fleet positions. Backed by the simulated GPS provider today. */
export function useFleet() {
  const transit = useTransitData();
  const [live, setLive] = useState<BusTelemetry[]>([]);

  const { buses, routes } = transit;
  const ready = buses.length > 0 && routes.size > 0;

  useEffect(() => {
    if (!ready) return;
    const provider = createSimulatedGpsProvider(buses, routes);
    const unsubscribe = provider.subscribe(setLive);
    return () => {
      unsubscribe();
      provider.stop();
    };
  }, [ready, buses, routes]);

  return { ...transit, live };
}
