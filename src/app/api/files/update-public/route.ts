import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(req: Request) {
  try {
    const { fileId, isPublic } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    await db.file.update({
      where: { id: fileId },
      data: { public: isPublic },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating public status:", error);
    return NextResponse.json({ error: "Failed to update public status" }, { status: 500 });
  }
}