"use client";

import dynamic from "next/dynamic";
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

const CrisisMap = dynamic(
  () =>
    import("@/components/map/crisis-map").then((mod) => mod.CrisisMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-xl">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    ),
  }
);

export function MapWrapper({ requests }: { requests: AidRequest[] }) {
  return <CrisisMap requests={requests} />;
}
