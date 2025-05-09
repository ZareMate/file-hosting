import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { minioClient } from "~/utils/minioClient";
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

    const bucketName = process.env.MINIO_BUCKET || "file-hosting";
    const objectName = `${file.id}-${file.name}`; // Construct the object name in MinIO

    // Fetch the file from MinIO
    const stream = await minioClient.getObject(bucketName, objectName);

    const mimeType = getFileType(file.name); // Get the MIME type based on the file extension

    // Return the file as a binary response
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file from MinIO:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}