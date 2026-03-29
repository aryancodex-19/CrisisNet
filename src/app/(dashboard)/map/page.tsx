import { getAidRequests } from "@/app/actions/aid-requests";
import { MapPageClient } from "@/components/map-page-client";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const requests = await getAidRequests();

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          Transparency Map
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Live view of all aid requests across Mumbai · Red = Pending · Orange = Dispatched · Green = Fulfilled
        </p>
      </div>

      <div className="flex-1 h-[calc(100%-4rem)] rounded-xl overflow-hidden border border-border/50">
        <MapPageClient initialRequests={JSON.parse(JSON.stringify(requests))} />
      </div>
    </div>
  );
}
