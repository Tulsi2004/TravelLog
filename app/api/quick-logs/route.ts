import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET active quick log or recent logs
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active (incomplete) quick log
    const activeLog = await prisma.quickLog.findFirst({
      where: {
        userId,
        isCompleted: false
      },
      include: {
        template: {
          include: {
            stops: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ activeLog });
  } catch (error) {
    console.error("Error fetching quick log:", error);
    return NextResponse.json({ error: "Failed to fetch quick log" }, { status: 500 });
  }
}

// POST start new quick log session
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId } = body;

    // Check for active session
    const activeLog = await prisma.quickLog.findFirst({
      where: {
        userId,
        isCompleted: false
      }
    });

    if (activeLog) {
      return NextResponse.json({ error: "Active session exists" }, { status: 400 });
    }

    const quickLog = await prisma.quickLog.create({
      data: {
        userId,
        templateId,
        stops: [],
        isCompleted: false
      },
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

    return NextResponse.json(quickLog);
  } catch (error) {
    console.error("Error creating quick log:", error);
    return NextResponse.json({ error: "Failed to create quick log" }, { status: 500 });
  }
}
