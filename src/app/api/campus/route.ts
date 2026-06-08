import { prisma } from "@/lib/prisma";

export async function GET() {
  const buildings = await prisma.campusBuilding.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json(buildings);
}
