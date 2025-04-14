"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function SharePage() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!fileId) {
          throw new Error("File name is required.");
        }
        const response = await fetch(`/api/serv?id=${encodeURIComponent(fileId)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to load image.");
      }
    };

    void fetchImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fileId, imageSrc]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!imageSrc) {
    return <div>Loading...</div>;
  }

  return (
      imageSrc
  );
}