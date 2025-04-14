//!eslint-disable @typescript-eslint/no-unsafe-assignment
//!eslint-disable @typescript-eslint/no-unsafe-argument

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { env } from "~/env.js";
interface File {
  id: string;
  name: string;
  url: string;
}

interface FileGridProps {
  session: { user: { id: string } } | null;
}

export default function FileGrid({ session }: FileGridProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pageUrl = env.NEXT_PUBLIC_PAGE_URL; // Assuming PAGE_URL is defined in your environment variables

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json() as { files: File[] }; // Explicitly type the response
      setFiles(data.files);
    } catch (err) {
      console.error(err);
      setError("Failed to load files.");
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files/download?fileId=${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`File "${fileName}" downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file.");
    }
  };

  useEffect(() => {
    if (!session?.user) {
      setError("You must be logged in to view files.");
      return;
    }

    // Fetch files initially
    void fetchFiles();

    // Listen for real-time updates via SSE
    const eventSource = new EventSource("/api/files/stream");

    eventSource.onmessage = (event) => {
      const data: { type: string; file?: File; fileId?: string } = JSON.parse(event.data); // Explicitly type the parsed data

      if (data.type === "file-added" && data.file) {
        if (data.file) {
          setFiles((prevFiles) => [...prevFiles, data.file as File]);
        }
        toast.success(`File "${data.file.name}" added!`);
      } else if (data.type === "file-removed" && data.fileId) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== data.fileId));
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Cleanup on unmount
    };
  }, [session]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(pageUrl + url)
      .then(() => toast.success("File URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  const handleRemove = async (fileId: string) => {
    try {
      const response = await fetch(`/api/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: fileId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.success("File removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove file.");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
          >
            
            <button onClick={() => router.push(env.NEXT_PUBLIC_PAGE_URL + file.url)}>
              <h3 className="text-2xl font-bold">{file.name}</h3>
            </button>
            <div className="flex gap-2">
              {/* Download Button */}
              <button
                onClick={() => handleDownload(file.name)}
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
                  viewBox="0 24 24"
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
        ))}
      </div>
  );
}