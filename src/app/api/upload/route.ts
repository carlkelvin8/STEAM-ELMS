import { NextRequest } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Only image files are allowed (JPEG, PNG, WEBP, GIF, AVIF)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File size must be under 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return Response.json({ error: "Invalid file extension" }, { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await writeFile(join(uploadDir, filename), buffer);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
