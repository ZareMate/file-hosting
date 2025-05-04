import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { db } from "~/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("id"); // Get the `id` parameter from the query

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  try {
    // Fetch file metadata from the database
    const file = await db.file.findFirst({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), "uploads", file.id);

    // Read the file from the filesystem
    const fileBuffer = await fs.readFile(filePath);

    const mimeType = file.extension === ".mp4"
      ? "video/mp4"
      : file.extension === ".webm"
      ? "video/webm"
      : file.extension === ".ogg"
      ? "video/ogg"
      : file.extension === ".jpg" || file.extension === ".jpeg"
      ? "image/jpeg"
      : file.extension === ".png"
      ? "image/png"
      : file.extension === ".gif"
      ? "image/gif"
      : file.extension === ".svg"
      ? "image/svg+xml"
      : file.extension === ".mp3"
      ? "audio/mpeg"
      : file.extension === ".wav"
      ? "audio/wav"
      : "application/octet-stream";

    // Return the file as a binary response
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}