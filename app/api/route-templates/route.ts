import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all route templates for user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.routeTemplate.findMany({
      where: { userId, isActive: true },
      include: {
        stops: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching route templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST create new route template
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, fromLocation, toLocation, transport, estimatedCost, estimatedExpense, stops } = body;

    const template = await prisma.routeTemplate.create({
      data: {
        userId,
        name,
        fromLocation,
        toLocation,
        transport: transport || "train",
        estimatedCost: parseFloat(estimatedCost) || 0,
        estimatedExpense: parseFloat(estimatedExpense) || 0,
        stops: {
          create: stops.map((stop: string, index: number) => ({
            name: stop,
            order: index
          }))
        }
      },
      include: {
        stops: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating route template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
