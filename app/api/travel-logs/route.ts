import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.travelLog.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching travel logs:", error);
    return NextResponse.json({ error: "Failed to fetch travel logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fromLocation, toLocation, startTime, endTime, transport, cost, expense, notes } = body;

    const log = await prisma.travelLog.create({
      data: {
        userId,
        fromLocation,
        toLocation,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        transport,
        cost: parseFloat(cost),
        expense: expense ? parseFloat(expense) : 0,
        notes: notes || null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error creating travel log:", error);
    return NextResponse.json({ error: "Failed to create travel log" }, { status: 500 });
  }
}
