import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const buildings = await prisma.campusBuilding.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json(buildings);
}
