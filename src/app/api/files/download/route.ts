import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("fileId");
  const fileName = url.searchParams.get("fileName");

  if (!fileId) {
    return NextResponse.json({ error: "File id is required" }, { status: 400 });
  }
  if (!fileName){
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", fileId);
    const fileBuffer = await fs.readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}