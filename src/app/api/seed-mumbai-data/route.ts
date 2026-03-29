import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const MUMBAI_LOCATIONS = [
  { name: "Dharavi", lat: 19.0422, lng: 72.8515 },
  { name: "Kurla West", lat: 19.0726, lng: 72.8794 },
  { name: "Vasai East", lat: 19.3691, lng: 72.8311 },
  { name: "Malad West", lat: 19.1862, lng: 72.8484 },
  { name: "Andheri East", lat: 19.1197, lng: 72.8464 },
  { name: "Bandra West", lat: 19.0596, lng: 72.8295 },
  { name: "Worli", lat: 19.0176, lng: 72.8152 },
  { name: "Dadar", lat: 19.0178, lng: 72.8478 },
  { name: "Colaba", lat: 18.9067, lng: 72.8147 },
  { name: "Thane West", lat: 19.2183, lng: 72.9781 },
  { name: "Borivali East", lat: 19.2328, lng: 72.8568 },
  { name: "Goregaon West", lat: 19.1663, lng: 72.8488 },
  { name: "Chembur", lat: 19.0522, lng: 72.8949 },
  { name: "Navi Mumbai - Vashi", lat: 19.0771, lng: 73.0086 },
  { name: "Sion", lat: 19.0408, lng: 72.8617 },
];

export async function GET() {
  try {
    // Clear existing data
    await prisma.aidRequest.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash("password123", 12);

    // Create users
    const admin = await prisma.user.create({
      data: {
        name: "Rajesh Kumar",
        email: "admin@crisisnet.in",
        passwordHash,
        role: "ADMIN",
        phone: "+91 98765 43210",
      },
    });

    const ngo = await prisma.user.create({
      data: {
        name: "Priya Sharma",
        email: "ngo@crisisnet.in",
        passwordHash,
        role: "NGO",
        phone: "+91 98765 43211",
      },
    });

    const volunteer = await prisma.user.create({
      data: {
        name: "Amit Patel",
        email: "volunteer@crisisnet.in",
        passwordHash,
        role: "VOLUNTEER",
        phone: "+91 98765 43212",
      },
    });

    const victim = await prisma.user.create({
      data: {
        name: "Sunita Devi",
        email: "victim@crisisnet.in",
        passwordHash,
        role: "VICTIM",
        phone: "+91 98765 43213",
      },
    });

    // Create resources
    await prisma.resource.createMany({
      data: [
        { type: "FOOD", quantity: 500, unit: "packets", location: "Mumbai Central Warehouse" },
        { type: "WATER", quantity: 1000, unit: "liters", location: "Andheri Distribution Hub" },
        { type: "MEDICINE", quantity: 200, unit: "kits", location: "Sion Hospital Supply" },
      ],
    });

    // Create aid requests
    const users = [admin, ngo, volunteer, victim];
    const resourceTypes = ["FOOD", "WATER", "MEDICINE"] as const;
    const statuses = ["PENDING", "DISPATCHED", "FULFILLED"] as const;

    const aidRequests = MUMBAI_LOCATIONS.map((loc, i) => ({
      requestedById: users[i % users.length].id,
      resourceType: resourceTypes[i % resourceTypes.length],
      quantityNeeded: Math.floor(Math.random() * 50) + 10,
      latitude: loc.lat,
      longitude: loc.lng,
      locationName: loc.name,
      urgency: (i % 4) + 1,
      status: statuses[i % statuses.length],
      notes: `Urgent relief needed in ${loc.name}. Affected families: ${Math.floor(Math.random() * 100) + 20}.`,
    }));

    await prisma.aidRequest.createMany({ data: aidRequests });

    const counts = {
      users: await prisma.user.count(),
      resources: await prisma.resource.count(),
      aidRequests: await prisma.aidRequest.count(),
    };

    return NextResponse.json({
      message: "Mumbai mock data seeded successfully!",
      counts,
      credentials: {
        admin: "admin@crisisnet.in / password123",
        ngo: "ngo@crisisnet.in / password123",
        volunteer: "volunteer@crisisnet.in / password123",
        victim: "victim@crisisnet.in / password123",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}
