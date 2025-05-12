import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const fileId = url.searchParams.get("id");

  if (!fileId) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  try {
    const file = await db.file.findFirst({
      where: { id: fileId },
      include: { uploadedBy: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: file.name,
      size: file.size,
      owner: file.uploadedBy?.name ?? null,
      ownerId: file.uploadedBy?.id ?? null,
      ownerAvatar: file.uploadedBy?.image ?? null,
      uploadDate: file.uploadDate,
      id: file.id,
      isOwner: null,
      type: file.extension,
      url: file.url,
      description: file.description,
      isPublic: file.public, // Ensure this is included
    });
  } catch (error) {
    console.error("Error fetching file details:", error);
    return NextResponse.json({ error: "Failed to fetch file details" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { id: string; description: string } | null;
    if (!body?.id || body.description === undefined) {
      // Allow empty description but ensure id is present
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const resource = await db.file.findUnique({
      where: { id: body.id },
    });

    if (!resource) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (resource.uploadedById !== session.user.id) {
      return NextResponse.json({ error: "You are not authorized to modify this file" }, { status: 403 });
    }

    await db.file.update({
      where: { id: body.id },
      data: { description: body.description },
    });

    return NextResponse.json({ message: "Description updated successfully" });
  } catch (error) {
    console.error("Error updating description:", error);
    return NextResponse.json({ error: "Failed to update description" }, { status: 500 });
  }
}