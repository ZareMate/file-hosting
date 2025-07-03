"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { FilePreview } from "~/app/_components/FilePreview";
import { HomeButton } from "~/app/_components/HomeButton";
import { Toaster } from "react-hot-toast";
import {
  FileActionsContainer,
  FileDescriptionContainer,
} from "~/app/_components/ActionButtons";
import { auth } from "~/server/auth";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  ownerId: string;
  ownerAvatar: string | null;
  uploadDate: string;
  id: string;
  type: string;
  url: string;
  description: string;
  isPublic: boolean;
}

export default function FilePreviewContainer() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ user?: { id: string } } | null>(null);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
      setLoading(false);
    }
    fetchSession();
  }, []);

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/share?id=${encodeURIComponent(fileId)}`
    )
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setFileDetails(data))
      .finally(() => setLoading(false));
  }, [fileId]);

  if (!fileId || (!loading && !fileDetails)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="absolute top-4 left-4">
          <HomeButton />
        </div>
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">No</span> File Found
          </h1>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="absolute top-4 left-4">
          <HomeButton />
        </div>
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">Loading...</span>
          </h1>
        </div>
      </main>
    );
  }

  if (!fileDetails) {
    // This should never happen due to the earlier check, but for type safety
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="absolute top-4 left-4">
        <HomeButton />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container flex flex-col items-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">File</span> Details
        </h1>
        <div className="mt-6">
          {fileDetails.type !== "unknown" && (
            <FilePreview fileId={fileDetails.id} fileType={fileDetails.type} share={true} />
          )}
        </div>
        <div className="w-full max-w-md rounded-lg bg-white/10 p-6 text-white shadow-md">
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
              className="inline size-5 rounded-md"
              src={fileDetails.ownerAvatar || ""}
              alt="Owner avatar"
            />{" "}
            {fileDetails.owner}
          </p>
          <p>
            <strong>Upload Date:</strong>{" "}
            {new Date(fileDetails.uploadDate).toLocaleString()}
          </p>
          <div>
            <strong>Description:</strong>{" "}
            {session?.user && fileDetails.ownerId == session.user.id ? (
              // Allow editing description if the user is the owner
              <FileDescriptionContainer
                fileId={fileDetails.id}
                fileDescription={fileDetails.description}
              />
            ) : (
              <span style={{ whiteSpace: "pre-line" }}>
              {fileDetails.description || "No description provided."}
            </span>)}
          </div>
          <div className="mt-4 flex justify-center">
            {session?.user ? (
              <FileActionsContainer
                fileId={fileDetails.id}
                fileName={fileDetails.name}
                fileUrl={fileDetails.url}
                isOwner={fileDetails.ownerId == session?.user.id}
                isPublic={fileDetails.isPublic}
              />
            ) : (
              <FileActionsContainer
                fileId={fileDetails.id}
                fileName={fileDetails.name}
                fileUrl={fileDetails.url}
                isOwner={false}
                isPublic={fileDetails.isPublic}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
