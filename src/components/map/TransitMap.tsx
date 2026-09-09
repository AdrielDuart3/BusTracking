import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

import { formatRelative, type LatLng } from "@/lib/geo";
import type { BusTelemetry } from "@/lib/gps";
import type { Stop } from "@/lib/transit";
import { cn } from "@/lib/utils";

export type RouteLine = { id: string; color: string; points: LatLng[] };

export type TransitMapProps = {
  buses?: BusTelemetry[];
  stops?: Stop[];
  routes?: RouteLine[];
  center?: [number, number];
  zoom?: number;
  focus?: [number, number] | null;
  className?: string;
  onSelectBus?: (bus: BusTelemetry) => void;
  onSelectStop?: (stop: Stop) => void;
  renderStopPopup?: (stop: Stop) => React.ReactNode;
};

const STATUS_COLOR: Record<string, string> = {
  "Em movimento": "#16a34a",
  Parado: "#eab308",
  "Fora de operação": "#dc2626",
};

function busIcon(bus: BusTelemetry) {
  const ring = STATUS_COLOR[bus.status] ?? "#16a34a";
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `<div style="width:38px;height:38px;border-radius:14px;background:${bus.lineColor};display:grid;place-items:center;box-shadow:0 6px 16px rgba(15,23,42,.35);border:3px solid ${ring};transition:all .6s linear">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a2 2 0 0 1-1 1.7V19a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2.3A2 2 0 0 1 4 15V6Zm2 1v4h12V7H6Zm1.5 8a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm9 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/></svg>
    </div>`,
  });
}

const stopIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#fff;border:4px solid #1d4ed8;box-shadow:0 2px 8px rgba(15,23,42,.3)"></div>`,
});

function MapFocus({ focus }: { focus?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo(focus, Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [focus, map]);
  return null;
}

export default function TransitMap({
  buses = [],
  stops = [],
  routes = [],
  center = [-23.2015, -46.5405],
  zoom = 13,
  focus = null,
  className,
  onSelectBus,
  onSelectStop,
  renderStopPopup,
}: TransitMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={cn("h-full w-full", className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapFocus focus={focus} />

      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: route.color, weight: 5, opacity: 0.65 }}
        />
      ))}

      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon}
          eventHandlers={{ click: () => onSelectStop?.(stop) }}
        >
          <Popup>
            {renderStopPopup ? (
              renderStopPopup(stop)
            ) : (
              <div className="space-y-1">
                <p className="font-semibold">{stop.name}</p>
                <p className="text-xs text-muted-foreground">{stop.address}</p>
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={busIcon(bus)}
          eventHandlers={{ click: () => onSelectBus?.(bus) }}
        >
          <Popup>
            <div className="min-w-[15rem] space-y-1 text-sm">
              <p className="font-display text-base font-bold">Ônibus {bus.code}</p>
              <p>
                <span className="text-muted-foreground">Linha:</span> {bus.lineCode} —{" "}
                {bus.lineName}
              </p>
              <p>
                <span className="text-muted-foreground">Destino:</span> {bus.destination}
              </p>
              <p>
                <span className="text-muted-foreground">Velocidade:</span> {bus.speedKmh} km/h
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span> {bus.status}
              </p>
              <p>
                <span className="text-muted-foreground">Próximo ponto:</span> {bus.nextStopName} (
                {bus.distanceToNextStopKm.toFixed(2)} km · {bus.etaMinutes} min)
              </p>
              <p className="text-xs text-muted-foreground">
                Última atualização: {formatRelative(bus.updatedAt)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
