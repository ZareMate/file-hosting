import { notFound } from "next/navigation";
import { FilePreview } from "~/app/_components/FilePreview";
import { HomeButton } from "~/app/_components/HomeButton"; // Import the client component
import { Toaster } from "react-hot-toast";
import {
  FileActionsContainer,
  FileDescriptionContainer,
} from "~/app/_components/ActionButtons"; // Import the client component
import type { Metadata } from "next";
import { checkOwner } from "~/utils/checkOwner"; // Import the client component
import { auth } from "~/server/auth";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  ownerId: string;
  ownerAvatar: string | null;
  uploadDate: string;
  id: string;
  isOwner: boolean;
  type: string;
  url: string;
  description: string;
  isPublic: boolean;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams; // Resolve the promise
  const fileId = resolvedSearchParams.id;

  if (!fileId) {
    return {
      title: "File Not Found",
      description: "The file you are looking for does not exist.",
    };
  }

  const fileDetails = await fetchFileDetails(fileId);

  if (!fileDetails) {
    return {
      title: "File Not Found",
      description: "The file you are looking for does not exist.",
    };
  }

  return {
    title: fileDetails.name,
    description: fileDetails.description || fileDetails.name,
    openGraph: {
      title: fileDetails.name,
      description: fileDetails.description || fileDetails.name,
      url: `${process.env.NEXT_PUBLIC_PAGE_URL}/share?id=${fileDetails.id}`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/serv?id=${fileDetails.id}`,
          alt: `${fileDetails.name} preview`,
        },
      ],
    },
  };
}

async function fetchFileDetails(fileId: string): Promise<FileDetails | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/share?id=${encodeURIComponent(
        fileId,
      )}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("Failed to fetch file details:", err);
    return null;
  }
}

export default async function FilePreviewContainer({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedSearchParams = await searchParams; // Resolve the promise
  const fileId = resolvedSearchParams.id;

  if (!fileId) {
    notFound();
  }

  const fileDetails = await fetchFileDetails(fileId);
  const session = await auth();

  if (!fileDetails) {
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
            <FileDescriptionContainer
              fileId={fileDetails.id}
              fileDescription={fileDetails.description}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <FileActionsContainer
              fileId={fileDetails.id}
              fileName={fileDetails.name}
              fileUrl={fileDetails.url}
              isOwner={session?.user?.id ? await checkOwner(fileDetails.ownerId, session.user.id) : false}
              isPublic={fileDetails.isPublic}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
