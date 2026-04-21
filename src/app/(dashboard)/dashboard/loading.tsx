import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          Command Center
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time overview of disaster relief operations across Mumbai
        </p>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
                  <div className="h-8 w-14 bg-muted/40 rounded animate-pulse" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted/50 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Inventory Skeleton */}
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="h-5 w-40 bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted/40 rounded animate-pulse" />
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Requests Skeleton */}
        <Card className="lg:col-span-2 bg-card/90 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="h-5 w-36 bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-2"
              >
                <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted/40 rounded animate-pulse" />
                <div className="h-5 w-14 bg-muted/50 rounded-full animate-pulse" />
                <div className="h-5 w-18 bg-muted/50 rounded-full animate-pulse" />
                <div className="h-4 w-28 bg-muted/30 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
