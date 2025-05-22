import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { minioClient, ensureBucketExists } from "~/utils/minioClient";
import cuid from "cuid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, fileType } = await req.json();

  // Basic validation
  if (
    typeof fileName !== "string" ||
    !fileName.match(/^[a-zA-Z0-9._-]{1,128}$/) ||
    typeof fileType !== "string" ||
    fileType.length > 128
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const bucketName = process.env.MINIO_BUCKET || "file-hosting";
  await ensureBucketExists(bucketName);

  const fileId = session.user.id + "-" + cuid();
  const objectName = `${fileId}-${fileName}`;

  // 15 min expiry
  const presignedUrl = await minioClient.presignedPutObject(
    bucketName,
    objectName,
    15 * 60
  );

  return NextResponse.json({
    url: presignedUrl,
    objectName,
    fileId,
  });
}