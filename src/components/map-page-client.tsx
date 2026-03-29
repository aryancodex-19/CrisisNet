"use client";

import { useRealtimeRequests } from "@/hooks/use-realtime-requests";
import { MapWrapper } from "@/components/map/map-wrapper";
import { Badge } from "@/components/ui/badge";
import type { RequestStatus, ResourceType } from "@prisma/client";

interface AidRequest {
  id: string;
  resourceType: ResourceType;
  quantityNeeded: number;
  latitude: number;
  longitude: number;
  locationName: string | null;
  urgency: number;
  status: RequestStatus;
  notes: string | null;
  createdAt: string;
  requestedBy?: {
    name: string;
  };
}

export function MapPageClient({
  initialRequests,
}: {
  initialRequests: AidRequest[];
}) {
  const requests = useRealtimeRequests(initialRequests);

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const dispatched = requests.filter((r) => r.status === "DISPATCHED").length;
  const fulfilled = requests.filter((r) => r.status === "FULFILLED").length;

  return (
    <div className="relative w-full h-full">
      {/* Legend overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Live Status
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span className="text-xs text-slate-300">Pending ({pending})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-xs text-slate-300">Dispatched ({dispatched})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs text-slate-300">Fulfilled ({fulfilled})</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-700/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Realtime</span>
          </div>
        </div>
      </div>

      <MapWrapper requests={requests} />
    </div>
  );
}
