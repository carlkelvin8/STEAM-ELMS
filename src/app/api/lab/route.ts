import { prisma } from "@/lib/prisma";

export async function GET() {
  const experiments = await prisma.labExperiment.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(experiments);
}
