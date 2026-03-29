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

  if (!["ADMIN", "NGO", "VOLUNTEER"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  const request = await prisma.aidRequest.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/requests");
  revalidatePath("/map");

  return request;
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
