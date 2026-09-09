import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Line = {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  start_time: string;
  end_time: string;
  frequency_min: number;
  status: string;
  color: string;
  estimated_minutes: number;
};

export type Stop = {
  id: string;
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type LineStop = { id: string; line_id: string; stop_id: string; position: number };

export type Bus = {
  id: string;
  code: string;
  line_id: string;
  destination: string;
  status: string;
  speed_kmh: number;
  lat: number;
  lng: number;
  updated_at: string;
};

export type Schedule = {
  id: string;
  line_id: string;
  departure_time: string;
  direction: string;
  weekday: string;
};

type TableName = "lines" | "stops" | "line_stops" | "buses" | "schedules";

async function selectAll<T>(table: TableName, order: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").order(order);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}


export const linesQuery = queryOptions({
  queryKey: ["lines"],
  queryFn: () => selectAll<Line>("lines", "code"),
  staleTime: 5 * 60_000,
});

export const stopsQuery = queryOptions({
  queryKey: ["stops"],
  queryFn: () => selectAll<Stop>("stops", "code"),
  staleTime: 5 * 60_000,
});

export const lineStopsQuery = queryOptions({
  queryKey: ["line_stops"],
  queryFn: () => selectAll<LineStop>("line_stops", "position"),
  staleTime: 5 * 60_000,
});

export const busesQuery = queryOptions({
  queryKey: ["buses"],
  queryFn: () => selectAll<Bus>("buses", "code"),
  staleTime: 60_000,
});

export const schedulesQuery = queryOptions({
  queryKey: ["schedules"],
  queryFn: () => selectAll<Schedule>("schedules", "departure_time"),
  staleTime: 5 * 60_000,
});

export const WEEKDAYS = [
  { value: "util", label: "Dias úteis" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export const DIRECTIONS = [
  { value: "ida", label: "Ida" },
  { value: "volta", label: "Volta" },
];
