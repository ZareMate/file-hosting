"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FilePreview } from "~/app/_components/FilePreview";
import { useFileActions } from "~/app/_components/FileActions";
import Head from "next/head";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  ownerAvatar: string | null;
  uploadDate: string;
  id: string;
  isOwner: boolean;
  type: string;
  url: string;
  description: string;
}

function FilePreviewContainerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileId = searchParams.get("id");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { handleDescriptionChange, handleCopyUrl, handleDownload, handleRemove } = useFileActions(
    () => {},
    setDescription,
    fileId || undefined
  );

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

  useEffect(() => {
    if (!fileId) {
      setError("File name is required.");
      return;
    }

    const fetchFileDetails = async () => {
      try {
        const response = await fetch(`/api/share?id=${encodeURIComponent(fileId)}`);
        if (!response.ok) throw new Error("Failed to fetch file details");

        const data: FileDetails = await response.json();
        setFileDetails(data);
        setDescription(data.description);
      } catch (err) {
        console.error(err);
        setError("Failed to load file details.");
      }
    };

    fetchFileDetails();
  }, [fileId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!fileDetails) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
          >
            Home
          </button>
        </div>
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">No</span> File Found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{fileDetails.name} - File Details</title>
        <meta
          property="og:title"
          content={`${fileDetails.name} - File Details`}
        />
        <meta
          property="og:description"
          content={`Size: ${
            fileDetails.size > 1024 * 1024 * 1024
              ? (fileDetails.size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
              : fileDetails.size > 1024 * 1024
              ? (fileDetails.size / (1024 * 1024)).toFixed(2) + " MB"
              : fileDetails.size > 1024
              ? (fileDetails.size / 1024).toFixed(2) + " KB"
              : fileDetails.size + " Bytes"
          }, Owner: ${fileDetails.owner}, Uploaded on: ${new Date(
            fileDetails.uploadDate
          ).toLocaleString()}`}
        />
        <meta property="og:type" content="website" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
          >
            Home
          </button>
        </div>
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">File</span> Details
          </h1>
          <div className="mt-6">
            {fileDetails.type !== "unknown" && (
              <FilePreview fileId={fileDetails.id} fileType={getFileType(fileDetails.type)} />
            )}
          </div>
          <div className="bg-white/10 shadow-md rounded-lg p-6 w-full max-w-md text-white">
            <p>
              <strong>Name:</strong> {fileDetails.name}
            </p>
            <p>
              <strong>Size:</strong>{" "}
              {fileDetails.size > 1024 * 1024 * 1024
                ? (fileDetails.size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
                : fileDetails.size > 1024 * 1024
                ? (fileDetails.size / (1024 * 1024)).toFixed(2) + " MB"
                : fileDetails.size > 1024
                ? (fileDetails.size / 1024).toFixed(2) + " KB"
                : fileDetails.size + " Bytes"}
            </p>
            <p>
              <strong>Owner:</strong>{" "}
              <img
                className="rounded-md inline size-5"
                src={fileDetails.ownerAvatar || ""}
                alt="Owner avatar"
              />{" "}
              {fileDetails.owner}
            </p>
            <p>
              <strong>Upload Date:</strong>{" "}
              {new Date(fileDetails.uploadDate).toLocaleString()}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {fileDetails.isOwner ? (
                <textarea
                  value={description}
                  onChange={(e) => handleDescriptionChange(e, debounceTimer)}
                  className="w-full h-24 p-2 bg-white/10 rounded-lg text-white"
                />
              ) : fileDetails.description === "" ? (
                <span>No description available</span>
              ) : (
                <span>{fileDetails.description}</span>
              )}
            </p>
            {fileDetails.isOwner && (
              <div className="flex place-content-center gap-4 mt-4">
                <button
                  onClick={() => handleDownload(fileDetails.id, fileDetails.name)}
                  className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 flex items-center gap-2"
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
                <button
                  onClick={() => handleCopyUrl(fileDetails.url)}
                  className="rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600 flex items-center gap-2"
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
                <button
                  onClick={() => handleRemove(fileDetails.id)}
                  className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600 flex items-center gap-2"
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
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function FilePreviewContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilePreviewContainerContent />
    </Suspense>
  );
}

