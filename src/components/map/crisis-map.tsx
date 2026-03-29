"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import {
  getStatusColor,
  getUrgencyLabel,
  getUrgencyColor,
  getResourceIcon,
  formatDate,
} from "@/lib/utils";
import type { RequestStatus, ResourceType } from "@prisma/client";

// Mumbai bounds
const MUMBAI_CENTER: [number, number] = [19.076, 72.8777];
const MUMBAI_BOUNDS: L.LatLngBoundsExpression = [
  [18.85, 72.75],
  [19.45, 73.1],
];

// Custom marker icons
function createIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid rgba(255,255,255,0.9);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    "><div style="
      width: 8px; height: 8px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const statusIcons: Record<string, L.DivIcon> = {
  PENDING: createIcon("#ef4444"),
  DISPATCHED: createIcon("#f59e0b"),
  FULFILLED: createIcon("#10b981"),
};

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

function MapBounds() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(MUMBAI_BOUNDS);
    map.setMinZoom(10);
  }, [map]);
  return null;
}

export function CrisisMap({ requests }: { requests: AidRequest[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-xl">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={MUMBAI_CENTER}
      zoom={11}
      maxBounds={MUMBAI_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapBounds />

      {requests.map((req) => (
        <Marker
          key={req.id}
          position={[req.latitude, req.longitude]}
          icon={statusIcons[req.status] || statusIcons.PENDING}
        >
          <Popup className="crisis-popup">
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-900">
                  {req.locationName || "Unknown Location"}
                </h3>
                <span className="text-lg">{getResourceIcon(req.resourceType)}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resource:</span>
                  <span className="font-medium">{req.resourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{req.quantityNeeded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Urgency:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getUrgencyColor(req.urgency)}`}>
                    {getUrgencyLabel(req.urgency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                {req.requestedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">By:</span>
                    <span className="font-medium">{req.requestedBy.name}</span>
                  </div>
                )}
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-muted-foreground">{formatDate(req.createdAt)}</span>
                </div>
                {req.notes && (
                  <p className="text-slate-600 italic pt-1">{req.notes}</p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
