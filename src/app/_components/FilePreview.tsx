"use client";

import { useEffect, useState } from "react";

interface FilePreviewProps {
  fileId: string;
  fileType: string; // Pass the file type as a prop
}

export function FilePreview({ fileId, fileType }: FilePreviewProps) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      ".zip": "archive/zip",
      ".rar": "archive/rar",
      ".pdf": "text/pdf",
      ".txt": "text/plain",
      ".c" : "code/c",
      ".cpp" : "code/cpp",
      ".py" : "code/python",
      ".js" : "code/javascript",
      ".html" : "code/html",
      ".css" : "code/css",
      ".md" : "markdown/markdown",
      ".json" : "code/json",
      ".xml" : "code/xml",
      ".csv" : "code/csv",
    };
    return fileTypes[extension] || "unknown";
  };

  if (getFileType(fileType).startsWith("video")) {
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
  if (getFileType(fileType).startsWith("audio")) {
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
  if (getFileType(fileType).startsWith("image")) {
    return <img src={mediaSrc} alt="Media preview" className="max-w-full max-h-96 rounded-lg shadow-md" />;
  }

  if (getFileType(fileType).startsWith("text")) {
    return (
      <img src="/icons/files/text.svg" alt="Text file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  if (getFileType(fileType).startsWith("archive")) {
    return (
      <img src="/icons/files/archive.svg" alt="Archive file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  if (getFileType(fileType).startsWith("code")) {
    return (
      <img src="/icons/files/code.svg" alt="Code file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }
  // if (getFileType(fileType).startsWith("markdown")) {
  //   return;      
  //   }


  return;
}