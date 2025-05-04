'use client';
import { useRef, useState } from "react";
import { useFileActions } from "~/app/_components/FileActions";

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
  const { handleDownload, handleCopyUrl, handleRemove} = useFileActions(() => fileId, (description: string) => {
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
        <img src="/icons/download.svg" alt="Download" className="w-6 h-6" />
      </button>

      {/* Copy URL Button */}
      <button
        onClick={() => handleCopyUrl(fileUrl)}
        className="flex items-center justify-center rounded-full bg-green-500 p-2 hover:bg-green-600"
      >
        <img src="/icons/copy.svg" alt="Copy URL" className="w-6 h-6" />
      </button>

      {/* Remove Button */}
      <button
        onClick={() => handleRemove(fileId)}
        className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-600"
      >
        <img src="/icons/delete.svg" alt="Remove" className="w-6 h-6" />
      </button>
    </div>
  );
}

export function FileDescriptionContainer({
  fileId,
  fileDescription,
}: {
  fileId: string;
  fileDescription?: string;
}) {

  const [description, setDescription] = useState(fileDescription || ""); // Add state for description
  const { handleDescriptionChange } = useFileActions(() => {}, (description: string) => {
    setDescription(description);
    return undefined;
  }, fileId); // Wrap setDescription in a function
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Initialize debounce timer

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleDescriptionChange(e, debounceTimer); // Pass the debounce timer
  };

  return (
    <div className="flex self-center gap-2">
      <textarea
        className="w-full h-24 p-2 border rounded-md bg-gray-800 text-white"
        value={description} // Use state value
        onChange={handleChange}
        placeholder="Enter file description..."
        maxLength={200} // Limit to 200 characters
      />
    </div>
  );
}