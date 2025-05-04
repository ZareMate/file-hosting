import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { db } from "~/server/db";
import { getFileType } from "~/utils/fileType";

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

    const mimeType = getFileType(path.extname(file.name)); // Get the MIME type based on the file extension


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