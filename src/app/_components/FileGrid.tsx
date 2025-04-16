"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { env } from "~/env.js";
import { FilePreview } from "~/app/_components/FilePreview";
import { useFileActions } from "~/app/_components/FileActions";

interface FileDetails {
  id: string;
  name: string;
  url: string;
  description: string;
  extension: string;
}

interface FileGridProps {
  session: { user: { id: string } } | null;
}

export default function FileGrid({ session }: FileGridProps) {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pageUrl = env.NEXT_PUBLIC_PAGE_URL;

  const { handleDownload, handleCopyUrl, handleRemove } = useFileActions(setFiles);

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = (await response.json()) as { files: FileDetails[] };
      setFiles(data.files);
    } catch (err) {
      console.error(err);
      setError("Failed to load files.");
    }
  };

  // Determine file type based on extension
  const getFileType = (extension: string): string => {
    const fileTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".ogg": "video/ogg",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
    };
    return fileTypes[extension] || "unknown";
  };

  // Handle real-time updates via SSE
  useEffect(() => {
    if (!session?.user) {
      setError("You must be logged in to view files.");
      return;
    }

    void fetchFiles();

    const eventSource = new EventSource("/api/files/stream");
    eventSource.onmessage = (event) => {
      const data: { type: string; file?: FileDetails; fileId?: string } = JSON.parse(event.data);

      if (data.type === "file-added" && data.file) {
        setFiles((prevFiles) => (data.file ? [...prevFiles, data.file] : prevFiles));
        toast.success(`File "${data.file.name}" added!`);
      } else if (data.type === "file-removed" && data.fileId) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== data.fileId));
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [session]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
      {files.map((file) => {
        const fileType = getFileType(file.extension);

        return (
          <div
            key={file.id}
            className="flex place-content-end max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
          >
            {fileType !== "unknown" && <div className=" self-center max-w-50"><FilePreview fileId={file.id} fileType={fileType} /></div>}

            <button onClick={() => router.push(pageUrl + file.url)}>
              <h3 className="text-2xl font-bold">{file.name}</h3>
            </button>
            {file.description && (<p className="text-sm text-gray-400">Description: {file.description}</p>)}
            

            <div className="flex self-center gap-2">
              {/* Download Button */}
              <button
                onClick={() => handleDownload(file.id, file.name)}
                className="flex items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
                  />
                </svg>
              </button>

              {/* Copy URL Button */}
              <button
                onClick={() => handleCopyUrl(file.url)}
                className="flex items-center justify-center rounded-full bg-green-500 p-2 hover:bg-green-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9h8m-6 4h4m-7 8h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(file.id)}
                className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}