export type LatLng = { lat: number; lng: number };

const R = 6371; // km

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function formatRelative(iso: string): string {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `há ${diff} segundo${diff === 1 ? "" : "s"}`;
  const min = Math.round(diff / 60);
  if (min < 60) return `há ${min} minuto${min === 1 ? "" : "s"}`;
  return `há ${Math.round(min / 60)} h`;
}

export function formatTime(value: string): string {
  return value.slice(0, 5);
}
