"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface FileDetails {
  name: string;
  size: number;
  owner: string;
  uploadDate: string;
  id: string; // Add an ID for the file
  isOwner: boolean; // Add a flag to indicate ownership
  type: string; // Add a type field to differentiate between file types
  url: string; // Add a URL field for the file
}

export default function UploadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileName = searchParams.get("file");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileName) {
      setError("File name is required.");
      return;
    }

    const fetchFileDetails = async () => {
      try {
        const response = await fetch(`/api/share?file=${encodeURIComponent(fileName)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch file details");
        }

        const data = await response.json();
        setFileDetails(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load file details.");
      }
    };

    fetchFileDetails();
  }, [fileName]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/files/download?fileName=${encodeURIComponent(fileName || "")}`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "downloaded-file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file.");
    }
  };

  const handleShare = () => {
    if (fileDetails) {
      const shareableLink = `${window.location.origin}/share?id=${fileDetails.name}`;
      navigator.clipboard
        .writeText(shareableLink)
        .then(() => toast.success("Shareable link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  const handleRemove = async () => {
    try {
      const response = await fetch(`/api/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: fileDetails?.id }), // Use the ID of the file
      });

      if (!response.ok) {
        throw new Error("Failed to remove file");
      }

      toast.success("File removed successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove file.");
    }
  };

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
        <div className=" mt-6">
            {(fileDetails.type.startsWith(".png") || fileDetails.type.startsWith(".jpg") || fileDetails.type.startsWith(".jpeg") || fileDetails.type.startsWith(".gif")) && (
              <SharePage />
            )}
            {(fileDetails.type.startsWith(".mp4") || fileDetails.type.startsWith(".webm") || fileDetails.type.startsWith(".ogg")) && (
              <video controls className="max-w-full max-h-96 rounded-lg shadow-md">
              <SharePage />
              Your browser does not support the video tag.
              </video>
            )}
          </div>
        <div className="bg-white/10 shadow-md rounded-lg p-6 w-full max-w-md text-white">
          <p>
            <strong>Name:</strong> {fileDetails.name}
          </p>
          <p>
            <strong>Size:</strong> {(fileDetails.size / 1024).toFixed(2)} KB
          </p>
          <p>
            <strong>Owner:</strong> {fileDetails.owner}
          </p>
          <p>
            <strong>Upload Date:</strong> {new Date(fileDetails.uploadDate).toLocaleString()}
          </p>
        </div>
        {/* Preview Section */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDownload}
            className="rounded-full bg-blue-500 px-10 py-3 font-semibold no-underline transition hover:bg-blue-600"
          >
            Download
          </button>
          {fileDetails.isOwner && (
            <>
              <button
                onClick={handleShare}
                className="rounded-full bg-green-500 px-10 py-3 font-semibold no-underline transition hover:bg-green-600"
              >
                Share
              </button>
              <button
                onClick={handleRemove}
                className="rounded-full bg-red-500 px-10 py-3 font-semibold no-underline transition hover:bg-red-600"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export function SharePage() {
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchImage = async () => {
      try {
        if (!fileName) {
          throw new Error("File name is required.");
        }
        const response = await fetch(`/api/serv?id=${encodeURIComponent(fileName)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to load image.");
        console.log(err);
      }
    };

    fetchImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc); // Clean up the object URL
      }
    };
  }, [fileName]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!imageSrc) {
    return <div>Loading...</div>;
  }

  return (
    <source src={imageSrc} className="max-w-full max-h-96 rounded-lg shadow-md" />
  );
}