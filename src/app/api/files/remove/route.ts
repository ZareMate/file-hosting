import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { minioClient } from "~/utils/minioClient";
import { notifyClients } from "~/utils/notifyClients";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { id: string } | null;
    if (!body?.id) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const file = await db.file.findUnique({ where: { id: body.id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.uploadedById !== session.user.id) {
      return NextResponse.json({ error: "You are not authorized to delete this file" }, { status: 403 });
    }

    const objectName = `${file.id}-${file.name}`;
    await minioClient.removeObject(process.env.MINIO_BUCKET || "file-hosting", objectName);

    await db.file.delete({ where: { id: body.id } });

    notifyClients({ type: "file-removed", fileId: body.id });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file from MinIO:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}