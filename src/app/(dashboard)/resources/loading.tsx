import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function ResourcesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          Resource Inventory
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track available supplies across Mumbai relief centers
        </p>
      </div>

      {/* Resource Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted/40 rounded animate-pulse" />
                  <div className="h-3.5 w-14 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-muted/50 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="w-full h-2 bg-muted/30 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Inventory Skeleton */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted/50 rounded animate-pulse" />
              <div className="h-3.5 w-56 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
          </div>
        </CardHeader>
      </Card>

      {/* Activity Log Skeleton */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-5 w-44 bg-muted/50 rounded animate-pulse" />
          <div className="h-3.5 w-64 bg-muted/30 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-5 w-14 bg-muted/50 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-10 bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted/20 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
