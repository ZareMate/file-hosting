"use client";

import { useEffect, useState } from "react";
import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import "github-markdown-css/github-markdown.css";
import "../styles/custom.css"; // Adjust the path as necessary
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

interface FilePreviewProps {
  fileId: string;
  fileType: string; // Pass the file type as a prop
}

export function FilePreview({ fileId, fileType, share }: FilePreviewProps & { share: boolean }) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [fetchSrc, setFetchSrc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  console.log("File Type:", fileType);

  useEffect(() => {
    if (!fileId) {
      setError("File ID is required.");
      return;
    }
    setFetchSrc(false)

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


    // If the file type is a video, audio, image, code or markdown, fetch the media
    if (fileType.startsWith("video") || fileType.startsWith("audio") || fileType.startsWith("image") || fileType.startsWith("code") || fileType.startsWith("markdown")) {
      setFetchSrc(true);
      fetchMedia();
      console.log("Fetching media for fileId:", fileId);
    } else {
      console.log("No media fetch needed for fileId:", fileId);
      setFetchSrc(false);
      return;
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, fileType]);

  useEffect(() => {
    if (fileType.startsWith("markdown")) {
      const fetchMarkdown = async () => {
        try {
          const result = await renderMarkdown({ id: fileId });
          setMarkdownContent(result.props.postData.contentHtml);
        } catch (err) {
          console.error("Failed to fetch markdown content:", err);
        }
      };

      fetchMarkdown();
    }
  }, [fileId, fileType]);


  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!mediaSrc && !markdownContent && fetchSrc) {
    return <div>Loading...</div>;
  }

  if (fileType.startsWith("markdown")) {
    if (share) {
      return (
        <div className="overflow-y-auto max-h-96 rounded-lg shadow-md">
          {markdownContent ? (
            <MarkdownRenderer markdownContent={markdownContent} />
          ) : (
            <div>Loading markdown...</div>
          )}
        </div>
      );
    }
    return (
      <img src="/icons/files/code.svg" alt="Code file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }

  if (fileType.startsWith("video")) {
    return (
      <video
        controls
        className="max-w-full max-h-96 rounded-lg shadow-md"
        src={mediaSrc || "/icons/files/file.svg"}
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
        src={mediaSrc || "/icons/files/file.svg"}
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }
  if (fileType.startsWith("image")) {
    return <img src={mediaSrc || "/icons/files/file.svg"} alt="Media preview" className="max-w-full max-h-96 rounded-lg shadow-md" />;
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
  if (fileType.startsWith("code")) {
    return (
      <img src="/icons/files/code.svg" alt="Code file preview" className="max-w-full max-h-96 rounded-lg invert" />
    );
  }

  console.log("Unsupported file type:", fileType);

  return null;
}

export async function rendererMarkdown(id: string) {
  const fileContents = await fetch(`/api/files/serv?id=${encodeURIComponent(id)}`)
    .then((res) => res.text())
    .catch((err) => {
      console.error("Failed to fetch file contents:", err);
      return null;
    });

  if (!fileContents) {
    throw new Error("File contents could not be fetched.");
  }
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}

export async function renderMarkdown({ id }: { id: string }) {
  const postData = await rendererMarkdown(id);

  return {
    props: {
      postData,
    },
  };
}