import { getResources, getInventoryLogs } from "@/app/actions/resources";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  UtensilsCrossed,
  Droplets,
  Pill,
  MapPin,
} from "lucide-react";
import { getResourceIcon } from "@/lib/utils";
import { InventoryManager } from "@/components/inventory-manager";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [resources, inventoryLogs] = await Promise.all([
    getResources(),
    getInventoryLogs(50),
  ]);
  const session = await auth();

  const typeDetails: Record<string, { icon: typeof Package; color: string; maxQty: number }> = {
    FOOD: { icon: UtensilsCrossed, color: "from-amber-500 to-orange-500", maxQty: 500 },
    WATER: { icon: Droplets, color: "from-blue-500 to-cyan-500", maxQty: 1000 },
    MEDICINE: { icon: Pill, color: "from-emerald-500 to-teal-500", maxQty: 200 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          Resource Inventory
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track available supplies across Mumbai relief centers
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource) => {
          const details = typeDetails[resource.type] || {
            icon: Package,
            color: "from-slate-500 to-slate-600",
            maxQty: 100,
          };
          const Icon = details.icon;
          const percentage = Math.round(
            (resource.quantity / details.maxQty) * 100
          );
          const barColor =
            percentage > 50
              ? "from-emerald-500 to-teal-500"
              : percentage > 20
              ? "from-amber-500 to-orange-500"
              : "from-red-500 to-rose-500";

          return (
            <Card
              key={resource.id}
              className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden group hover:border-border transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {resource.type}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {resource.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">{resource.unit}</p>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${details.color} shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {resource.location && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {resource.location}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Manager (Add Stock + Activity Log) */}
      <InventoryManager
        initialLogs={JSON.parse(JSON.stringify(inventoryLogs))}
        resources={JSON.parse(JSON.stringify(resources))}
      />

      {/* Detailed Table */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Inventory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Resource</TableHead>
                <TableHead className="text-muted-foreground text-xs">Quantity</TableHead>
                <TableHead className="text-muted-foreground text-xs">Unit</TableHead>
                <TableHead className="text-muted-foreground text-xs">Storage Location</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const percentage = Math.round(
                  (resource.quantity /
                    (typeDetails[resource.type]?.maxQty || 100)) *
                    100
                );
                return (
                  <TableRow
                    key={resource.id}
                    className="border-border/50 hover:bg-muted/20"
                  >
                    <TableCell className="text-foreground text-sm font-medium">
                      {getResourceIcon(resource.type)} {resource.type}
                    </TableCell>
                    <TableCell className="text-foreground text-sm font-bold">
                      {resource.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {resource.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {resource.location || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          percentage > 50
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : percentage > 20
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {percentage > 50
                          ? "Adequate"
                          : percentage > 20
                          ? "Low Stock"
                          : "Critical"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
