import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import path from "path";
import { promises as fs } from "fs";
import { notifyClients } from "../files/stream/route";

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null); // Handle empty or invalid JSON
    if (!body || !body.id) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const resourceId = body.id;

    const resource = await db.file.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.uploadedById !== session.user.id) {
      return NextResponse.json({ error: "Resource not found or unauthorized" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "uploads", path.basename(resource.name));
    await fs.unlink(filePath).catch((err) => {
      console.error("Error deleting file from filesystem:", err);
    });

    await db.file.delete({
      where: { id: resourceId },
    });

    // Notify clients about the deleted file
    notifyClients({ type: "file-removed", fileId: resourceId });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}