import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, differenceInHours } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all logs for this month
    const logs = await prisma.travelLog.findMany({
      where: {
        userId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Calculate analytics
    let totalHours = 0;
    let totalCost = 0;
    const transportCounts: Record<string, number> = {};
    let longestTrip = { duration: 0, from: "", to: "", transport: "" };

    logs.forEach((log: any) => {
      // Calculate duration
      const duration = differenceInHours(new Date(log.endTime), new Date(log.startTime));
      totalHours += duration;

      // Sum cost
      totalCost += log.cost;

      // Count transport types
      transportCounts[log.transport] = (transportCounts[log.transport] || 0) + 1;

      // Find longest trip
      if (duration > longestTrip.duration) {
        longestTrip = {
          duration,
          from: log.fromLocation,
          to: log.toLocation,
          transport: log.transport,
        };
      }
    });

    // Find most used transport
    let mostUsedTransport = "";
    let maxCount = 0;
    Object.entries(transportCounts).forEach(([transport, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTransport = transport;
      }
    });

    return NextResponse.json({
      totalHours,
      totalCost,
      mostUsedTransport: mostUsedTransport || "N/A",
      transportCounts,
      longestTrip: longestTrip.duration > 0 ? longestTrip : null,
      totalTrips: logs.length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
