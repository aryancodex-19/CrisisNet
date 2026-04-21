import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function RequestsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-primary" />
            Aid Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all disaster relief requests across Mumbai
          </p>
        </div>
        <div className="h-10 w-36 bg-muted/50 rounded-md animate-pulse" />
      </div>

      {/* Filter Skeleton */}
      <Card className="bg-card/90 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-4 w-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-9 w-40 bg-muted/40 rounded-md animate-pulse" />
            <div className="h-9 w-40 bg-muted/40 rounded-md animate-pulse" />
            <div className="h-3.5 w-32 bg-muted/30 rounded animate-pulse ml-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
            {["w-20", "w-24", "w-16", "w-10", "w-14", "w-18", "w-24", "w-20"].map(
              (w, i) => (
                <div
                  key={i}
                  className={`h-3 ${w} bg-muted/40 rounded animate-pulse`}
                />
              )
            )}
          </div>
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-border/30"
            >
              <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
              <div className="space-y-1">
                <div className="h-3.5 w-20 bg-muted/40 rounded animate-pulse" />
                <div className="h-2.5 w-12 bg-muted/20 rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-8 bg-muted/30 rounded animate-pulse" />
              <div className="h-5 w-14 bg-muted/40 rounded-full animate-pulse" />
              <div className="h-5 w-18 bg-muted/40 rounded-full animate-pulse" />
              <div className="h-3.5 w-28 bg-muted/20 rounded animate-pulse" />
              <div className="h-7 w-16 bg-muted/40 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
