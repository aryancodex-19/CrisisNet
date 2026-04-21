"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { addInventoryStock } from "@/app/actions/resources";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings2,
  History,
  PackagePlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import type { ResourceType, ChangeType } from "@prisma/client";
import { formatDate, getResourceIcon } from "@/lib/utils";

interface InventoryLogEntry {
  id: string;
  changeType: ChangeType;
  quantityChange: number;
  previousQty: number;
  newQty: number;
  reason: string | null;
  aidRequestId: string | null;
  createdAt: string;
  resource: {
    type: string;
    unit: string;
  };
  performedBy: {
    name: string;
    role: string;
  };
}

interface Resource {
  id: string;
  type: ResourceType;
  quantity: number;
  unit: string;
  location: string | null;
}

export function InventoryManager({
  initialLogs,
  resources,
}: {
  initialLogs: InventoryLogEntry[];
  resources: Resource[];
}) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState(initialLogs);
  const [currentResources, setCurrentResources] = useState(resources);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [resourceType, setResourceType] = useState<ResourceType>("FOOD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const canManageInventory =
    session?.user?.role &&
    ["ADMIN", "NGO"].includes(session.user.role);

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    startTransition(async () => {
      try {
        const updatedResource = await addInventoryStock({
          resourceType,
          quantity: parseInt(quantity),
          reason: reason || undefined,
        });

        // Update local resource state
        setCurrentResources((prev) =>
          prev.map((r) =>
            r.type === resourceType
              ? { ...r, quantity: updatedResource.quantity }
              : r
          )
        );

        // Add a new log entry to the top of the list
        const newLog: InventoryLogEntry = {
          id: `temp-${Date.now()}`,
          changeType: "ADD",
          quantityChange: parseInt(quantity),
          previousQty: updatedResource.quantity - parseInt(quantity),
          newQty: updatedResource.quantity,
          reason: reason || `Stock added by ${session?.user?.name}`,
          aidRequestId: null,
          createdAt: new Date().toISOString(),
          resource: {
            type: resourceType,
            unit: currentResources.find((r) => r.type === resourceType)?.unit || "units",
          },
          performedBy: {
            name: session?.user?.name || "Unknown",
            role: session?.user?.role || "ADMIN",
          },
        };
        setLogs((prev) => [newLog, ...prev]);

        toast.success(
          `Added ${quantity} ${resourceType.toLowerCase()} to inventory`,
          {
            description: `New total: ${updatedResource.quantity}`,
            icon: "📦",
          }
        );

        // Reset form
        setQuantity("");
        setReason("");
        setShowForm(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add stock"
        );
      }
    });
  };

  const getChangeIcon = (type: ChangeType) => {
    switch (type) {
      case "ADD":
        return <ArrowUpCircle className="w-4 h-4 text-emerald-400" />;
      case "DEDUCT":
        return <ArrowDownCircle className="w-4 h-4 text-red-400" />;
      case "ADJUSTMENT":
        return <Settings2 className="w-4 h-4 text-amber-400" />;
    }
  };

  const getChangeBadgeColor = (type: ChangeType) => {
    switch (type) {
      case "ADD":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "DEDUCT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ADJUSTMENT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  // Pagination for logs
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 8;
  const totalLogPages = Math.ceil(logs.length / logsPerPage);
  const paginatedLogs = logs.slice(
    (logPage - 1) * logsPerPage,
    logPage * logsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Add Inventory Section */}
      {canManageInventory && (
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-400" />
                  Add Inventory Stock
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Replenish supplies as new shipments arrive
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className={`transition-all duration-300 ${
                  showForm
                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {showForm ? (
                  "Cancel"
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Stock
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showForm && (
            <CardContent className="relative">
              <form onSubmit={handleAddStock} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Resource Type */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium text-sm">
                      Resource Type
                    </Label>
                    <Select
                      value={resourceType}
                      onValueChange={(v) =>
                        setResourceType((v as ResourceType) || "FOOD")
                      }
                    >
                      <SelectTrigger className="bg-background border-input hover:border-emerald-500/50 transition-colors h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOOD" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🍚</span> Food Packets
                          </span>
                        </SelectItem>
                        <SelectItem value="WATER" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">💧</span> Drinking Water
                          </span>
                        </SelectItem>
                        <SelectItem value="MEDICINE" className="py-2.5 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">💊</span> Medical Supplies
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium text-sm">
                      Quantity to Add
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      className="bg-background border-input hover:border-emerald-500/50 transition-colors h-11"
                    />
                  </div>
                </div>

                {/* Current Stock Preview */}
                {resourceType && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-lg">
                      {getResourceIcon(resourceType)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">
                        Current {resourceType} Stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentResources.find((r) => r.type === resourceType)
                          ?.quantity || 0}{" "}
                        {currentResources.find((r) => r.type === resourceType)
                          ?.unit || "units"}{" "}
                        available
                      </p>
                    </div>
                    {quantity && parseInt(quantity) > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          +{quantity}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">
                    Reason / Notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    placeholder="e.g. New shipment from Red Cross, Batch #RC-2024-0415"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="resize-none bg-background border-input hover:border-emerald-500/50 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Inventory...
                    </>
                  ) : (
                    <>
                      <PackagePlus className="w-4 h-4 mr-2" />
                      Confirm Stock Addition
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Inventory Activity Log */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Inventory Activity Log
          </CardTitle>
          <CardDescription className="text-sm">
            Complete audit trail of all inventory changes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">
                  Action
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Resource
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Change
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Stock
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Reason
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  By
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(log.changeType)}
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getChangeBadgeColor(log.changeType)}`}
                      >
                        {log.changeType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getResourceIcon(log.resource.type)}{" "}
                    {log.resource.type}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-bold ${
                        log.changeType === "ADD"
                          ? "text-emerald-400"
                          : log.changeType === "DEDUCT"
                          ? "text-red-400"
                          : "text-amber-400"
                      }`}
                    >
                      {log.changeType === "DEDUCT" ? "-" : "+"}
                      {log.quantityChange}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="text-foreground/60">{log.previousQty}</span>
                    <span className="mx-1.5 text-muted-foreground/50">→</span>
                    <span className="text-foreground font-medium">{log.newQty}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-foreground">{log.performedBy.name}</p>
                      <p className="text-[10px] text-muted-foreground">{log.performedBy.role}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No inventory activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalLogPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(logPage - 1) * logsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(logPage * logsPerPage, logs.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {logs.length}
                </span>{" "}
                entries
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage === 1}
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted/80 bg-transparent text-muted-foreground hover:text-foreground"
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm font-medium px-4 text-foreground">
                  Page {logPage} of {totalLogPages}
                </div>
                <Button
                  onClick={() =>
                    setLogPage((p) => Math.min(totalLogPages, p + 1))
                  }
                  disabled={logPage === totalLogPages}
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted/80 bg-transparent text-muted-foreground hover:text-foreground"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
