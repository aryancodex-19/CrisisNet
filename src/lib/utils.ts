import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUrgencyLabel(urgency: number): string {
  switch (urgency) {
    case 1: return "Critical";
    case 2: return "High";
    case 3: return "Medium";
    case 4: return "Low";
    default: return "Unknown";
  }
}

export function getUrgencyColor(urgency: number): string {
  switch (urgency) {
    case 1: return "bg-red-500/20 text-red-400 border-red-500/30";
    case 2: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case 3: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case 4: return "bg-green-500/20 text-green-400 border-green-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "VERIFIED": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "DISPATCHED": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "FULFILLED": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "REJECTED": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getResourceIcon(type: string): string {
  switch (type) {
    case "FOOD": return "🍚";
    case "WATER": return "💧";
    case "MEDICINE": return "💊";
    default: return "📦";
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
