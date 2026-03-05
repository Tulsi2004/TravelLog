import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the log belongs to the user
    const log = await prisma.travelLog.findUnique({
      where: { id: params.id },
    });

    if (!log || log.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.travelLog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting travel log:", error);
    return NextResponse.json({ error: "Failed to delete travel log" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fromLocation, toLocation, startTime, endTime, transport, cost, notes } = body;

    // Verify the log belongs to the user
    const existingLog = await prisma.travelLog.findUnique({
      where: { id: params.id },
    });

    if (!existingLog || existingLog.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const log = await prisma.travelLog.update({
      where: { id: params.id },
      data: {
        fromLocation,
        toLocation,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        transport,
        cost: parseFloat(cost),
        notes: notes || null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error updating travel log:", error);
    return NextResponse.json({ error: "Failed to update travel log" }, { status: 500 });
  }
}
