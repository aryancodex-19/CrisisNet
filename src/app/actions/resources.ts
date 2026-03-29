"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ResourceType } from "@prisma/client";

export async function getResources() {
  return prisma.resource.findMany({
    orderBy: { type: "asc" },
  });
}

export async function updateResource(
  id: string,
  data: { quantity: number; unit?: string; location?: string }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "NGO"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const resource = await prisma.resource.update({
    where: { id },
    data,
  });

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

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return resource;
}
