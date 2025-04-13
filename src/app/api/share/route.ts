import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";



export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const fileName = url.searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  try {
    const file = await db.file.findFirst({
      where: { name: fileName },
      include: { uploadedBy: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: file.name,
      size: file.size,
      owner: file.uploadedBy?.name || "Unknown",
      uploadDate: file.uploadDate,
      id: file.id,
      isOwner: session?.user?.id === file.uploadedById, // Check if the current user is the owner
      type: file.extension, // Add file type
      url: file.url, // Add file URL
    });
  } catch (error) {
    console.error("Error fetching file details:", error);
    return NextResponse.json({ error: "Failed to fetch file details" }, { status: 500 });
  }
}