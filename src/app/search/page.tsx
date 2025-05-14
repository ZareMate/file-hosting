"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { env } from "~/env.js";
import { FilePreview } from "~/app/_components/FilePreview";
import { FileActionsContainer } from "~/app/_components/ActionButtons";
import { HomeButton } from "~/app/_components/HomeButton";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  ownerId: string;
  ownerAvatar: string | null;
  uploadDate: string;
  id: string;
  isOwner: boolean;
  extension: string;
  url: string;
  description: string;
  isPublic: boolean;
}

export default function SearchFile() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pageUrl = env.NEXT_PUBLIC_PAGE_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `/api/files/search?query=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data.files);
      } catch (err) {
        console.error(err);
        setError("Failed to load files.");
      }
    };

    fetchFiles();
  }, [searchQuery]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="absolute top-4 left-4 z-20">
        <HomeButton />
      </div>
      {/* Search Bar */}
      <div className="sticky top-0 z-10 w-full bg-[#2e026d] px-4 py-4 shadow-md">
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 text-white bg-[#3b0764] rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M16.65 10.65a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </div>
      </div>

      {/* File Grid */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-7xl">
          {files.map((file) => {
            return (
              <div
                key={file.id}
                className="flex place-content-end w-xxs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              >
                <div className="self-center max-w-100 sm:max-w-50">
                  <FilePreview fileId={file.id} fileType={file.extension} share={false} />
                </div>

                <button onClick={() => router.push(pageUrl + file.url)}>
                  <h3 className="text-2xl font-bold">{file.name}</h3>
                </button>
                {file.description && (
                  <p className="text-sm text-gray-400">
                    Description: {file.description}
                  </p>
                )}

                <div className="flex self-center gap-2">
                  <FileActionsContainer
                    fileId={file.id}
                    fileName={file.name}
                    fileUrl={file.url}
                    isOwner={false}
                    isPublic={file.isPublic} // Check if the file is public
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
