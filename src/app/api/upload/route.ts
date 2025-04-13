import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import Busboy from "busboy";
import { Readable } from "stream";
import { notifyClients } from "../files/stream/route";

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

  const uploadDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  return new Promise<Response>((resolve, reject) => {
    const busboy = Busboy({ headers: { "content-type": req.headers.get("content-type") ?? "" } });
    let fileName = "";
    let fileBuffer = Buffer.alloc(0);

    busboy.on("file", async (fieldname, file, info) => {
      fileName = info.filename || "uploaded-file";
      const chunks: Buffer[] = [];

      // Check if a file with the same name already exists for the user
      const existingFile = await db.file.findFirst({
        where: {
          name: fileName,
          uploadedById: session.user.id,
        },
      });

      if (existingFile) {
        // Modify the file name to make it unique
        const fileExtension = path.extname(fileName);
        const baseName = path.basename(fileName, fileExtension);
        fileName = `${baseName}-${Date.now()}${fileExtension}`;
      }

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("finish", () => {
      void (async () => {
        try {
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, fileBuffer);
          const pageurl = new URL(req.url);
          //get root path of the url
          const pagePath = `${pageurl.protocol}//${pageurl.host}`;

          // Save file metadata to the database
          const newFile = await db.file.create({
            data: {
              url: `${pagePath}/share?file=${fileName}`,
              name: fileName,
              size: fileBuffer.length,
              extension: path.extname(fileName),
              uploadedById: session.user.id,
            },
          });

          // Notify clients about the new file
          notifyClients({ type: "file-added", file: newFile });

          resolve(NextResponse.json({ message: "File uploaded successfully" }));
        } catch (error) {
          console.error("Error handling upload:", error);
          resolve(NextResponse.json({ error: "Failed to upload file" }, { status: 500 }));
        }
      })();
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