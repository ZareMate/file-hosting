"use client";

import { useEffect, useState } from "react";

interface SharePageProps {
  fileId: string;
  fileType: string; // Pass the file type as a prop
}

export function SharePage({ fileId, fileType }: SharePageProps) {
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
        const response = await fetch(`/api/serv?id=${encodeURIComponent(fileId)}`);
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

  return <img src={mediaSrc} alt="Media preview" className="max-w-full max-h-96 rounded-lg shadow-md" />;
}