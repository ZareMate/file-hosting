import { notFound } from "next/navigation";
import { FilePreview } from "~/app/_components/FilePreview";
import { HomeButton } from "~/app/_components/HomeButton"; // Import the client component
import { Toaster } from "react-hot-toast";
import { FileActionsContainer, FileDescriptionContainer } from "~/app/_components/ActionButtons"; // Import the client component
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

async function fetchFileDetails(fileId: string): Promise<FileDetails | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/share?id=${encodeURIComponent(
        fileId
      )}`,
      { cache: "no-store" }
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
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_PAGE_URL}/api/files/serv?id=${fileId}`}
        />
        <meta property="og:image:alt" content={`${fileDetails.name} preview`} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_PAGE_URL}/share?id=${fileId}`}
        />
      </Head>
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
              <FilePreview
                fileId={fileDetails.id}
                fileType={fileDetails.type}
              />
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
            <div>
              <strong>Description:</strong>{" "}
              <FileDescriptionContainer fileId={fileDetails.id} fileDescription={fileDetails.description}/>
            </div>
            <div className="mt-4 flex justify-center">
              <FileActionsContainer
                fileId={fileDetails.id}
                fileName={fileDetails.name}
                fileUrl={fileDetails.url}
                isOwner={fileDetails.isOwner}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

