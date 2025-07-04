import { NextResponse } from "next/server";
import { db } from "~/server/db"; // Ensure this points to your Prisma client setup
import { auth } from "~/server/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    // If the user is not authenticated, return all public files
    try {
      const publicFiles = await db.file.findMany({
        where: { public: true },
        orderBy: { uploadDate: "desc" }, // Replace 'uploadDate' with the correct field name from your schema
      });
      return NextResponse.json({ files: publicFiles });
    } catch (error) {
      console.error("Error fetching public files:", error);
      return NextResponse.json({ error: "Failed to fetch public files" }, { status: 500 });
    }
  }

  try {
    const files = await db.file.findMany({
      where: { uploadedById: session.user.id
      },
      orderBy: { uploadDate: "desc" }, // Replace 'uploadDate' with the correct field name from your schema
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}