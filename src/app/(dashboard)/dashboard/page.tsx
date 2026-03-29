import { getDashboardStats } from "@/app/actions/aid-requests";
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
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  Droplets,
  Pill,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";
import {
  getStatusColor,
  getUrgencyLabel,
  getUrgencyColor,
  getResourceIcon,
  formatDate,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: AlertTriangle,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      bgGlow: "bg-blue-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingRequests,
      icon: Clock,
      gradient: "from-red-500 to-rose-500",
      shadow: "shadow-red-500/20",
      bgGlow: "bg-red-500/10",
    },
    {
      title: "Dispatched",
      value: stats.dispatchedRequests,
      icon: Truck,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      bgGlow: "bg-amber-500/10",
    },
    {
      title: "Fulfilled",
      value: stats.fulfilledRequests,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      bgGlow: "bg-emerald-500/10",
    },
  ];

  const resourceIcons: Record<string, typeof Package> = {
    FOOD: UtensilsCrossed,
    WATER: Droplets,
    MEDICINE: Pill,
  };

  return (
    <div className="space-y-6">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden relative group hover:border-border transition-all duration-300"
          >
            <div
              className={`absolute inset-0 ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}
                >
                  <stat.icon className="w-5 h-5 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Inventory */}
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Resource Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.resources.map((resource) => {
              const Icon = resourceIcons[resource.type] || Package;
              const percentage = Math.min(
                (resource.quantity /
                  (resource.type === "WATER" ? 1000 : resource.type === "FOOD" ? 500 : 200)) *
                  100,
                100
              );
              const barColor =
                percentage > 50
                  ? "bg-emerald-500"
                  : percentage > 20
                  ? "bg-amber-500"
                  : "bg-red-500";

              return (
                <div
                  key={resource.id}
                  className="p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {resource.type}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {resource.quantity} {resource.unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="lg:col-span-2 bg-card/90 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Location</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Urgency</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentRequests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="border-border/50 hover:bg-muted/20"
                  >
                    <TableCell className="text-foreground text-sm font-medium">
                      {req.locationName || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getResourceIcon(req.resourceType)} {req.resourceType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getUrgencyColor(req.urgency)}`}
                      >
                        {getUrgencyLabel(req.urgency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(req.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
