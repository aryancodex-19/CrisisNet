"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { RequestStatus, ResourceType } from "@prisma/client";

export async function createAidRequest(data: {
  resourceType: ResourceType;
  quantityNeeded: number;
  latitude: number;
  longitude: number;
  locationName?: string;
  urgency: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.aidRequest.create({
    data: {
      ...data,
      requestedById: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/requests");
  revalidatePath("/map");

  return request;
}

export async function updateAidRequestStatus(
  id: string,
  status: RequestStatus
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { role } = session.user;
  if (!["ADMIN", "NGO", "VOLUNTEER"].includes(role)) {
    throw new Error("Insufficient permissions");
  }

  // Enforce role-based actions
  if ((status as string) === "VERIFIED" && !["NGO", "ADMIN"].includes(role)) {
    throw new Error("Only NGOs and ADMINs can verify requests.");
  }
  if (status === "DISPATCHED" && role !== "ADMIN") {
    throw new Error("Only ADMINs can dispatch/approve supplies.");
  }

  const currentRequest = await prisma.aidRequest.findUnique({
    where: { id },
  });

  if (!currentRequest) throw new Error("Request not found");

  // If status is transitioning to DISPATCHED (approved), deduct stock and log
  if (status === "DISPATCHED" && currentRequest.status !== "DISPATCHED") {
    const resource = await prisma.resource.findUnique({
      where: { type: currentRequest.resourceType },
    });

    if (!resource || resource.quantity < currentRequest.quantityNeeded) {
      throw new Error(`Insufficient stock for ${currentRequest.resourceType}. Requested: ${currentRequest.quantityNeeded}, Available: ${resource?.quantity || 0}`);
    }

    const previousQty = resource.quantity;
    const newQty = previousQty - currentRequest.quantityNeeded;

    await prisma.$transaction([
      prisma.resource.update({
        where: { type: currentRequest.resourceType },
        data: { quantity: { decrement: currentRequest.quantityNeeded } },
      }),
      prisma.aidRequest.update({
        where: { id },
        data: { status },
      }),
      prisma.inventoryLog.create({
        data: {
          resourceId: resource.id,
          changeType: "DEDUCT",
          quantityChange: currentRequest.quantityNeeded,
          previousQty,
          newQty,
          reason: `Dispatched for aid request at ${currentRequest.locationName || "unknown location"}`,
          aidRequestId: id,
          performedById: session.user.id,
        },
      }),
    ]);
  } else if ((status as string) === "REJECTED" && currentRequest.status === "DISPATCHED") {
    // Rejected after dispatch — re-add stock and log
    const resource = await prisma.resource.findUnique({
      where: { type: currentRequest.resourceType },
    });

    if (resource) {
      const previousQty = resource.quantity;
      const newQty = previousQty + currentRequest.quantityNeeded;

      await prisma.$transaction([
        prisma.resource.update({
          where: { type: currentRequest.resourceType },
          data: { quantity: { increment: currentRequest.quantityNeeded } },
        }),
        prisma.aidRequest.update({
          where: { id },
          data: { status },
        }),
        prisma.inventoryLog.create({
          data: {
            resourceId: resource.id,
            changeType: "ADD",
            quantityChange: currentRequest.quantityNeeded,
            previousQty,
            newQty,
            reason: `Stock returned — aid request rejected after dispatch`,
            aidRequestId: id,
            performedById: session.user.id,
          },
        }),
      ]);
    } else {
      await prisma.aidRequest.update({
        where: { id },
        data: { status },
      });
    }
  } else {
    await prisma.aidRequest.update({
      where: { id },
      data: { status },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/requests");
  revalidatePath("/map");
  revalidatePath("/resources");

  return { success: true };
}

export async function getAidRequests(filters?: {
  status?: RequestStatus;
  resourceType?: ResourceType;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.resourceType) where.resourceType = filters.resourceType;

  if (session.user.role === "VICTIM") {
    where.requestedById = session.user.id;
  }

  return prisma.aidRequest.findMany({
    where,
    include: {
      requestedBy: {
        select: { name: true, email: true, role: true },
      },
    },
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
  });
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const whereCondition: Record<string, unknown> = {};
  if (session.user.role === "VICTIM") {
    whereCondition.requestedById = session.user.id;
  }

  const [
    totalRequests,
    pendingRequests,
    dispatchedRequests,
    fulfilledRequests,
    resources,
    recentRequests,
  ] = await Promise.all([
    prisma.aidRequest.count({ where: whereCondition }),
    prisma.aidRequest.count({ where: { ...whereCondition, status: "PENDING" } }),
    prisma.aidRequest.count({ where: { ...whereCondition, status: "DISPATCHED" } }),
    prisma.aidRequest.count({ where: { ...whereCondition, status: "FULFILLED" } }),
    prisma.resource.findMany(),
    prisma.aidRequest.findMany({
      where: whereCondition,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        requestedBy: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalRequests,
    pendingRequests,
    dispatchedRequests,
    fulfilledRequests,
    resources,
    recentRequests,
  };
}
