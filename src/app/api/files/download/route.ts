import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileName = url.searchParams.get("fileName");

  if (!fileName) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", fileName);
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