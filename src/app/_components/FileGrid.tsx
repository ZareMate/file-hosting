"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { env } from "~/env.js";
import { FilePreview } from "~/app/_components/FilePreview";
import { useFileActions } from "~/app/_components/FileActions";
import { FileActionsContainer } from "./ActionButtons";
import { checkOwner } from "~/utils/checkOwner"; // Import the client component

interface FileDetails {
  id: string;
  name: string;
  url: string;
  description: string;
  extension: string;
  isOwner: boolean; // Indicates if the user owns the file
  public: boolean; // Indicates if the file is public
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
            {<div className=" self-center max-w-50"><FilePreview fileId={file.id} fileType={file.extension} /></div>}

            <button onClick={() => router.push(pageUrl + file.url)}>
              <h3 className="text-2xl font-bold">{file.name}</h3>
            </button>
            {file.description && (<p className="text-sm text-gray-400">Description: {file.description}</p>)}
            

            <div className="flex self-center gap-2">
              <FileActionsContainer
                fileId={file.id}
                fileName={file.name}
                fileUrl={file.url}
                isOwner={true}
                isPublic={file.public}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}