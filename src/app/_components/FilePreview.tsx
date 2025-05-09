"use client";

import { useEffect, useState } from "react";
import { getFileType } from "~/utils/fileType"; // Adjust the import path as necessary

interface FilePreviewProps {
  fileId: string;
  fileType: string; // Pass the file type as a prop
}

export function FilePreview({ fileId, fileType }: FilePreviewProps) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log("File Type:", fileType);

  useEffect(() => {
    if (!fileId) {
      setError("File ID is required.");
      return;
    }

    let objectUrl: string | null = null;

    const fetchMedia = async () => {
      try {
        const response = await fetch(`/api/files/serv?id=${encodeURIComponent(fileId)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch media");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setMediaSrc(objectUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to load media.");
      }
    };

    fetchMedia();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!mediaSrc) {
    return <div>Loading...</div>;
  }

  if (fileType.startsWith("video")) {
    return (
      <video
        controls
        className="max-w-full max-h-96 rounded-lg shadow-md"
        src={mediaSrc}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
  if (fileType.startsWith("audio")) {
    return (
      <audio
        controls
        className="max-w-full max-h-96 rounded-lg shadow-md"
        src={mediaSrc}
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }
  if (fileType.startsWith("image")) {
    return <img src={mediaSrc} alt="Media preview" className="max-w-full max-h-96 rounded-lg shadow-md" />;
  }

  if (fileType.startsWith("text")) {
    return (
      <img src="/icons/files/text.svg" alt="Text file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  if (fileType.startsWith("archive")) {
    return (
      <img src="/icons/files/archive.svg" alt="Archive file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  if (fileType.startsWith("code") || fileType.startsWith("markdown")) {
    return (
      <img src="/icons/files/code.svg" alt="Code file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  // if (fileType.startsWith("markdown")) {
  //   return;      
  //   }

  // log file type
  console.log("Unsupported file type:", fileType);

  return;
}