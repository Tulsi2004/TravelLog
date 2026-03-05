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

    // Verify ownership
    const template = await prisma.routeTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.routeTemplate.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting route template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
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
    const { name, fromLocation, toLocation, transport, estimatedCost, stops } = body;

    // Verify ownership
    const existingTemplate = await prisma.routeTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate || existingTemplate.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete existing stops and create new ones
    await prisma.routeStop.deleteMany({
      where: { templateId: params.id }
    });

    const template = await prisma.routeTemplate.update({
      where: { id: params.id },
      data: {
        name,
        fromLocation,
        toLocation,
        transport,
        estimatedCost: parseFloat(estimatedCost),
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
    console.error("Error updating route template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
