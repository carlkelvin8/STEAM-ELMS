import { NextRequest } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File size must be under 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(join(process.cwd(), "public", "uploads", filename), buffer);

  return Response.json({ url: `/uploads/${filename}` });
}
