import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { minioClient } from "~/utils/minioClient";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("fileId");
  const fileName = url.searchParams.get("fileName");

  if (!fileId) {
    return NextResponse.json({ error: "File id is required" }, { status: 400 });
  }
  if (!fileName) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
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
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file from MinIO:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}