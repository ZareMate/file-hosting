'use client';
import {useFileActions} from "~/app/_components/FileActions";

export function FileActionsContainer({
  fileId,
  fileName,
  fileUrl,
  isOwner,
}: {
  fileId: string;
  fileName: string;
  fileUrl: string;
  isOwner: boolean;
}) {
  const { handleDownload, handleCopyUrl, handleRemove } = useFileActions(() => fileId, (description: string) => {
    if (isOwner) {
      console.log(description);
    }
  });

  return (
    <div className="flex self-center gap-2">
      {/* Download Button */}
      <button
        onClick={() => handleDownload(fileId, fileName)}
        className="flex items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
          />
        </svg>
      </button>

      {/* Copy URL Button */}
      <button
        onClick={() => handleCopyUrl(fileUrl)}
        className="flex items-center justify-center rounded-full bg-green-500 p-2 hover:bg-green-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9h8m-6 4h4m-7 8h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Remove Button */}
      <button
        onClick={() => handleRemove(fileId)}
        className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}