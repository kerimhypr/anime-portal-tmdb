import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatRuntime(minutes?: number) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
export function formatVote(v:number) { return v ? v.toFixed(1) : "N/A"; }
export function yearOf(date?: string|null) { return date ? new Date(date).getFullYear() : "—"; }
export function calcWatchTime(totalEpisodes:number, runtime=24, movies:number=0, movieAvg=110) {
  const minutes = totalEpisodes * runtime + movies * movieAvg;
  return { minutes, hours: +(minutes/60).toFixed(1), days: +(minutes/60/24).toFixed(2) };
}
export const GENRE_COLORS: Record<string,string> = {
  Action:"#FF6B9D", Adventure:"#00D9FF", Comedy:"#FFD93D", Drama:"#9C27B0", Fantasy:"#6BCB77", "Science Fiction":"#00BCD4", SciFi:"#00BCD4", Romance:"#E91E63", Horror:"#795548", Mystery:"#607D8B", Thriller:"#FF5722", Animation:"#6750A4", Family:"#8BC34A"
};
