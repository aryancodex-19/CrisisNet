"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateAidRequestStatus } from "@/app/actions/aid-requests";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStatusColor,
  getUrgencyLabel,
  getUrgencyColor,
  getResourceIcon,
  formatDate,
} from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Filter } from "lucide-react";
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
  requestedBy: {
    name: string;
    email: string;
    role: string;
  };
}

export function RequestsTable({
  initialRequests,
}: {
  initialRequests: AidRequest[];
}) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  const canUpdateStatus =
    session?.user?.role &&
    ["ADMIN", "NGO", "VOLUNTEER"].includes(session.user.role);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.resourceType !== typeFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusUpdate = (id: string, newStatus: RequestStatus) => {
    setUpdatingId(id);
    startTransition(async () => {
      try {
        await updateAidRequestStatus(id, newStatus);
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        toast.success(`Request updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update request");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-card/90 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
              <SelectTrigger className="w-40 bg-muted/80 border-slate-700/50 text-foreground text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-slate-700">
                <SelectItem value="ALL" className="text-foreground">All Statuses</SelectItem>
                <SelectItem value="PENDING" className="text-foreground">Pending NGO Verification</SelectItem>
                <SelectItem value="VERIFIED" className="text-foreground">Pending Admin Approval</SelectItem>
                <SelectItem value="DISPATCHED" className="text-foreground">Dispatched</SelectItem>
                <SelectItem value="FULFILLED" className="text-foreground">Fulfilled</SelectItem>
                <SelectItem value="REJECTED" className="text-foreground">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "ALL")}>
              <SelectTrigger className="w-40 bg-muted/80 border-slate-700/50 text-foreground text-sm">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-slate-700">
                <SelectItem value="ALL" className="text-foreground">All Types</SelectItem>
                <SelectItem value="FOOD" className="text-foreground">🍚 Food</SelectItem>
                <SelectItem value="WATER" className="text-foreground">💧 Water</SelectItem>
                <SelectItem value="MEDICINE" className="text-foreground">💊 Medicine</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/90 border-border/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Location</TableHead>
                <TableHead className="text-muted-foreground text-xs">Requested By</TableHead>
                <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                <TableHead className="text-muted-foreground text-xs">Qty</TableHead>
                <TableHead className="text-muted-foreground text-xs">Urgency</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                {canUpdateStatus && (
                  <TableHead className="text-muted-foreground text-xs">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((req) => (
                <TableRow
                  key={req.id}
                  className="border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="text-foreground text-sm font-medium">
                    {req.locationName || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{req.requestedBy.name}</p>
                      <p className="text-[10px] text-muted-foreground">{req.requestedBy.role}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getResourceIcon(req.resourceType)} {req.resourceType}
                  </TableCell>
                  <TableCell className="text-sm text-slate-300">
                    {req.quantityNeeded}
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
                  {canUpdateStatus && (
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {req.status === "PENDING" && ["NGO", "ADMIN"].includes(session?.user?.role || "") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(req.id, "VERIFIED" as RequestStatus)
                              }
                              disabled={isPending && updatingId === req.id}
                              className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              {isPending && updatingId === req.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(req.id, "REJECTED" as RequestStatus)
                              }
                              disabled={isPending && updatingId === req.id}
                              className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              {isPending && updatingId === req.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Reject"
                              )}
                            </Button>
                          </>
                        )}
                        {(req.status as string) === "VERIFIED" && session?.user?.role === "ADMIN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(req.id, "DISPATCHED" as RequestStatus)
                            }
                            disabled={isPending && updatingId === req.id}
                            className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          >
                            {isPending && updatingId === req.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Approve & Dispatch"
                            )}
                          </Button>
                        )}
                        {req.status === "DISPATCHED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(req.id, "FULFILLED" as RequestStatus)
                            }
                            disabled={isPending && updatingId === req.id}
                            className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            {isPending && updatingId === req.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Fulfill"
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canUpdateStatus ? 8 : 7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No requests found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="font-medium text-foreground">{filteredRequests.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="hover:bg-muted/80 bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center justify-center text-sm font-medium px-4 text-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="hover:bg-muted/80 bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
