import { MapPin } from "lucide-react";

export default function MapLoading() {
  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          Transparency Map
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Live view of all aid requests across Mumbai
        </p>
      </div>

      <div className="flex-1 h-[calc(100%-4rem)] rounded-xl overflow-hidden border border-border/50 bg-card/90 flex items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading map data...</span>
        </div>
      </div>
    </div>
  );
}
