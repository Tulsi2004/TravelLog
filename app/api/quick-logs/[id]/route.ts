import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST log a stop timestamp
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stopName, timestamp } = body;

    // Get current quick log
    const quickLog = await prisma.quickLog.findUnique({
      where: { id: params.id }
    });

    if (!quickLog || quickLog.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (quickLog.isCompleted) {
      return NextResponse.json({ error: "Log already completed" }, { status: 400 });
    }

    // Add stop to JSON array
    const stops = (quickLog.stops as any[]) || [];
    stops.push({ stopName, timestamp: timestamp || new Date().toISOString() });

    const updatedLog = await prisma.quickLog.update({
      where: { id: params.id },
      data: { stops },
      include: {
        template: {
          include: {
            stops: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error logging stop:", error);
    return NextResponse.json({ error: "Failed to log stop" }, { status: 500 });
  }
}

// PUT complete quick log and create TravelLog
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quickLog = await prisma.quickLog.findUnique({
      where: { id: params.id },
      include: {
        template: true
      }
    });

    if (!quickLog || quickLog.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const stops = quickLog.stops as any[];
    if (stops.length < 2) {
      return NextResponse.json({ error: "Need at least 2 stops" }, { status: 400 });
    }

    // Create TravelLog from quick log
    const startTime = new Date(stops[0].timestamp);
    const endTime = new Date(stops[stops.length - 1].timestamp);

    await prisma.travelLog.create({
      data: {
        userId,
        fromLocation: quickLog.template.fromLocation,
        toLocation: quickLog.template.toLocation,
        startTime,
        endTime,
        transport: quickLog.template.transport,
        cost: quickLog.template.estimatedCost,
        expense: quickLog.template.estimatedExpense,
        notes: stops.map((s: any) => `${new Date(s.timestamp).toLocaleTimeString()} - ${s.stopName}`).join('\n')
      }
    });

    // Mark quick log as completed
    const completedLog = await prisma.quickLog.update({
      where: { id: params.id },
      data: { isCompleted: true }
    });

    return NextResponse.json(completedLog);
  } catch (error) {
    console.error("Error completing quick log:", error);
    return NextResponse.json({ error: "Failed to complete log" }, { status: 500 });
  }
}

// DELETE cancel quick log
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quickLog = await prisma.quickLog.findUnique({
      where: { id: params.id }
    });

    if (!quickLog || quickLog.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.quickLog.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quick log:", error);
    return NextResponse.json({ error: "Failed to delete quick log" }, { status: 500 });
  }
}
