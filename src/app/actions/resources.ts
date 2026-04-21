"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ResourceType, ChangeType } from "@prisma/client";

export async function getResources() {
  return prisma.resource.findMany({
    orderBy: { type: "asc" },
  });
}

export async function addInventoryStock(data: {
  resourceType: ResourceType;
  quantity: number;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "NGO"].includes(session.user.role)) {
    throw new Error("Unauthorized: Only Admin and NGO can add inventory.");
  }

  if (data.quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  const resource = await prisma.resource.findUnique({
    where: { type: data.resourceType },
  });

  if (!resource) {
    throw new Error(`Resource type ${data.resourceType} not found in inventory.`);
  }

  const previousQty = resource.quantity;
  const newQty = previousQty + data.quantity;

  // Transaction: update resource + create log entry
  const [updatedResource] = await prisma.$transaction([
    prisma.resource.update({
      where: { type: data.resourceType },
      data: { quantity: newQty },
    }),
    prisma.inventoryLog.create({
      data: {
        resourceId: resource.id,
        changeType: "ADD" as ChangeType,
        quantityChange: data.quantity,
        previousQty,
        newQty,
        reason: data.reason || `Stock added by ${session.user.name}`,
        performedById: session.user.id,
      },
    }),
  ]);

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return updatedResource;
}

export async function updateResource(
  id: string,
  data: { quantity: number; unit?: string; location?: string }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "NGO"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const currentResource = await prisma.resource.findUnique({ where: { id } });
  if (!currentResource) throw new Error("Resource not found");

  const previousQty = currentResource.quantity;
  const newQty = data.quantity;
  const changeType: ChangeType = newQty > previousQty ? "ADD" : newQty < previousQty ? "DEDUCT" : "ADJUSTMENT";

  const [resource] = await prisma.$transaction([
    prisma.resource.update({
      where: { id },
      data,
    }),
    prisma.inventoryLog.create({
      data: {
        resourceId: id,
        changeType,
        quantityChange: Math.abs(newQty - previousQty),
        previousQty,
        newQty,
        reason: `Manual adjustment by ${session.user.name}`,
        performedById: session.user.id,
      },
    }),
  ]);

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return resource;
}

export async function createResource(data: {
  type: ResourceType;
  quantity: number;
  unit: string;
  location?: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const resource = await prisma.resource.create({ data });

  // Log the initial stock entry
  await prisma.inventoryLog.create({
    data: {
      resourceId: resource.id,
      changeType: "ADD" as ChangeType,
      quantityChange: data.quantity,
      previousQty: 0,
      newQty: data.quantity,
      reason: `Initial stock created by ${session.user.name}`,
      performedById: session.user.id,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return resource;
}

export async function getInventoryLogs(limit: number = 20) {
  return prisma.inventoryLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      resource: { select: { type: true, unit: true } },
      performedBy: { select: { name: true, role: true } },
    },
  });
}
