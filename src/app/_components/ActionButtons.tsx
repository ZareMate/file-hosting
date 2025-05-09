"use client";
import { useRef, useState } from "react";
import { useFileActions } from "~/app/_components/FileActions";

export function FileActionsContainer({
  fileId,
  fileName,
  fileUrl,
  isOwner,
  isPublic,
}: {
  fileId: string;
  fileName: string;
  fileUrl: string;
  isOwner: boolean;
  isPublic: boolean;
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
      {isOwner && (
      <button
        onClick={() => handleRemove(fileId)}
        className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-600"
      >
        <img src="/icons/delete.svg" alt="Remove" className="w-6 h-6" />
      </button>
      )}
      {isOwner && (
        <div className="mt-4 flex items-center gap-2">
        <label className="text-sm">
          Public:
        </label>
        <label
          htmlFor={`public-toggle-${fileId}`}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            id={`public-toggle-${fileId}`}
            type="checkbox"
            checked={isPublic} // Ensure this reflects the prop
            onChange={async (e) => {
              const newIsPublic = e.target.checked;
              try {
                const response = await fetch(`/api/files/update-public`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ fileId: fileId, isPublic: newIsPublic }),
                });
                if (!response.ok) {
                  throw new Error("Failed to update public status");
                }
                console.log("Public status updated successfully");
              } catch (err) {
                console.error("Error updating public status:", err);
              }
            }}
            className="sr-only peer"
          />
          {/* Toggle Background */}
          <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors"></div>
          {/* Toggle Handle */}
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition-transform"></div>
        </label>
      </div>
      )}
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