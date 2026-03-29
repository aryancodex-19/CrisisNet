"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

export function useRealtimeRequests(initialRequests: AidRequest[]) {
  const [requests, setRequests] = useState<AidRequest[]>(initialRequests);

  const handleInsert = useCallback((payload: { new: Record<string, unknown> }) => {
    const newReq = payload.new as unknown as AidRequest;
    setRequests((prev) => {
      const exists = prev.find((r) => r.id === newReq.id);
      if (exists) return prev;
      return [newReq, ...prev];
    });
  }, []);

  const handleUpdate = useCallback((payload: { new: Record<string, unknown> }) => {
    const updated = payload.new as unknown as AidRequest;
    setRequests((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("aid-requests-realtime")
      .on(
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "AidRequest" },
        handleInsert
      )
      .on(
        "postgres_changes" as never,
        { event: "UPDATE", schema: "public", table: "AidRequest" },
        handleUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleInsert, handleUpdate]);

  return requests;
}
