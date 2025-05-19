import { NextResponse } from "next/server";
import Busboy from "busboy";
import { Readable } from "stream";
import crypto from "crypto";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { minioClient, ensureBucketExists } from "~/utils/minioClient";
import { getFileType } from "~/utils/fileType";
import cuid from 'cuid';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucketName = process.env.MINIO_BUCKET || "file-hosting";
  await ensureBucketExists(bucketName);

  return new Promise<Response>((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": req.headers.get("content-type") ?? "" },
    });
    let fileName = "";
    let fileBuffer = Buffer.alloc(0);

    busboy.on("file", async (fieldname, file, info) => {
      fileName = info.filename || "uploaded-file";
      const chunks: Buffer[] = [];

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", async () => {
        fileBuffer = Buffer.concat(chunks);

        // Generate a unique ID for the file
        const fileId = session.user.id + "-" + cuid()
        const objectName = `${fileId}-${fileName}`;
        // Change UUID to CUID



        try {
          // Upload the file to MinIO
          await minioClient.putObject(bucketName, objectName, fileBuffer);

          // Save file metadata to the database
          const newFile = await db.file.create({
            data: {
              id: fileId,
              url: `/share?id=${fileId}`,
              name: fileName,
              size: fileBuffer.length,
              extension: getFileType(fileName),
              uploadedById: session.user.id,
            },
          });

          resolve(
            NextResponse.json({
              message: "File uploaded successfully",
              file: newFile,
            }),
          );
        } catch (error) {
          console.error("Error uploading file to MinIO:", error);
          reject(new Error("Failed to upload file"));
        }
      });
    });

    busboy.on("error", (error: unknown) => {
      console.error("Error parsing form data:", error);
      reject(new Error("Failed to parse form data"));
    });

    if (req.body) {
      const reader = req.body.getReader();
      const nodeStream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null); // End the stream
          } else {
            this.push(value); // Push data to the stream
          }
        },
      });

      nodeStream.pipe(busboy);
    }
  });
}
