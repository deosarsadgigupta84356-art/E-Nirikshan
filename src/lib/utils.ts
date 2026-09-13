import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatWhen(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function shortHash(hash?: string | null, n = 12): string {
  if (!hash) return "—";
  return hash.slice(0, n) + "…";
}

export function formatGps(lat?: number | null, lon?: number | null, acc?: number | null): string {
  if (lat == null || lon == null) return "Not captured";
  const a = acc != null ? ` ±${Math.round(acc)} m` : "";
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}${a}`;
}
