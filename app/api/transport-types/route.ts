import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // simply return all transport types; these are treated as global for the moment
    const types = await prisma.transportType.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching transport types:", error);
    return NextResponse.json({ error: "Failed to fetch transport types" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // ensure uniqueness (lowercase)
    const normalized = name.trim().toLowerCase();
    let transport;
    try {
      transport = await prisma.transportType.create({
        data: { name: normalized },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        // unique constraint failed, return existing record instead
        transport = await prisma.transportType.findUnique({ where: { name: normalized } });
      } else {
        throw err;
      }
    }

    return NextResponse.json(transport);
  } catch (error) {
    console.error("Error creating transport type:", error);
    return NextResponse.json({ error: "Failed to create transport type" }, { status: 500 });
  }
}
