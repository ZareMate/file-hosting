"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SharePage } from "~/app/_components/SharePage";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  owneravatar: string | null;
  uploadDate: string;
  id: string;
  isOwner: boolean;
  type: string;
  url: string;
}


function Details() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileId = searchParams.get("id");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine the file type based on the file extension
  const fileType = fileDetails?.type === ".mp4"
    ? "video/mp4"
    : fileDetails?.type === ".webm"
    ? "video/webm"
    : fileDetails?.type === ".ogg"
    ? "video/ogg"
    : fileDetails?.type === ".jpg" || fileDetails?.type === ".jpeg"
    ? "image/jpeg"
    : fileDetails?.type === ".png"
    ? "image/png"
    : fileDetails?.type === ".gif"
    ? "image/gif"
    : fileDetails?.type === ".svg"
    ? "image/svg+xml"
    : fileDetails?.type === ".mp3"
    ? "audio/mpeg"
    : fileDetails?.type === ".wav"
    ? "audio/wav"
    // if fileType is not one of the above, set it to unknown
    : "unknown";

  useEffect(() => {
    if (!fileId) {
      setError("File name is required.");
      return;
    }

    const fetchFileDetails = async () => {
      try {
        const response = await fetch(`/api/share?id=${encodeURIComponent(fileId)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch file details");
        }

        const data: FileDetails = await response.json();
        setFileDetails(data);
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
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            Home
          </button>
        </div>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">File</span> Details
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
        >
          Home
        </button>
      </div>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">File</span> Details
        </h1>
        <div className="mt-6">
          {// if fileType is not ubknown, show the media player
            fileType && !fileType.startsWith("unknown") ? (
              <SharePage fileId={fileDetails.id} fileType={fileType} />
            ) : null}
          
        </div>
        <div className="bg-white/10 shadow-md rounded-lg p-6 w-full max-w-md text-white">
          <p>
            <strong>Name:</strong> {fileDetails.name}
          </p>
          <p>
            <strong>Size:</strong> { // format size
              fileDetails.size > 1024 * 1024 * 1024 * 1024
                ? (fileDetails.size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB"
                : fileDetails.size > 1024 * 1024 * 1024
                ? (fileDetails.size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
                : fileDetails.size > 1024 * 1024
                ? (fileDetails.size / (1024 * 1024)).toFixed(2) + " MB"
                : fileDetails.size > 1024
                ? (fileDetails.size / 1024).toFixed(2) + " KB"
                : fileDetails.size + " Bytes"
            }
          </p>
          <p>
            <strong>Owner:</strong> <img className="rounded-md inline size-5" src={ fileDetails.owneravatar ? ( fileDetails.owneravatar) : ""} alt="owner image" /> {fileDetails.owner}
          </p>
          <p>
            <strong>Upload Date:</strong> {new Date(fileDetails.uploadDate).toLocaleString()}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Details />
    </Suspense>
  );
}
