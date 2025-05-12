"use client";
import { useRef, useState } from "react";
import { useFileActions } from "~/app/_components/FileActions";
import toast from "react-hot-toast";

export function FileActionsContainer({
  fileId,
  fileName,
  fileUrl,
  isOwner,
  isPublic: initialIsPublic, // Rename to avoid conflict with local state
}: {
  fileId: string;
  fileName: string;
  fileUrl: string;
  isOwner: boolean;
  isPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic); // Local state for toggle
  const { handleDownload, handleCopyUrl, handleRemove } = useFileActions(
    () => fileId,
    (description: string) => {
      if (isOwner) {
        console.log(description);
      }
    }
  );

  return (
    <div className="flex gap-2 self-center">
      {/* Download Button */}
      <button
      onClick={() => handleDownload(fileId, fileName)}
      className="flex items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600"
      >
      <img src="/icons/download.svg" alt="Download" className="h-6 w-6" />
      </button>

      {/* Copy URL Button */}
      <button
      onClick={() => {
        handleCopyUrl(fileUrl);
        toast.success("File URL copied to clipboard!");
      }}
      className="flex items-center justify-center rounded-full bg-green-500 p-2 hover:bg-green-600"
      >
      <img src="/icons/copy.svg" alt="Copy URL" className="h-6 w-6" />
      </button>

      {/* Remove Button */}
      {isOwner && (
      <button
        onClick={async () => {
        try {
          await handleRemove(fileId);
          toast.success("File removed successfully!");
        } catch (err) {
          toast.error("Failed to remove file.");
          console.error(err);
        }
        }}
        className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-600"
      >
        <img src="/icons/delete.svg" alt="Remove" className="h-6 w-6" />
      </button>
      )}

      {/* Public/Private Toggle */}
      {isOwner && (
      <button
        onClick={async () => {
        const newIsPublic = !isPublic;
        try {
          const response = await fetch(`/api/files/update-public`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: fileId,
            isPublic: newIsPublic,
          }),
          });
          if (!response.ok) {
          throw new Error("Failed to update public status");
          }
          setIsPublic(newIsPublic); // Update local state
          toast.success(
          `File is now ${newIsPublic ? "Public" : "Private"}!`
          );
        } catch (err) {
          toast.error("Error updating public status.");
          console.error(err);
        }
        }}
        className="flex items-center justify-center rounded-full bg-gray-500 p-2 hover:bg-gray-600 transition-all duration-300"
      >
        <img
        src={isPublic ? "/icons/public.svg" : "/icons/private.svg"}
        alt={isPublic ? "Public" : "Private"}
        className={`h-6 w-6 transition-transform duration-300 ${isPublic ? 'rotate-360' : 'rotate-0'}`}
        />
      </button>
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
  const { handleDescriptionChange } = useFileActions(
    () => {},
    (description: string) => {
      setDescription(description);
      return undefined;
    },
    fileId,
  ); // Wrap setDescription in a function
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Initialize debounce timer

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleDescriptionChange(e, debounceTimer); // Pass the debounce timer
  };

  return (
    <div className="flex gap-2 self-center">
      <textarea
        className="h-24 w-full rounded-md border bg-gray-800 p-2 text-white"
        value={description} // Use state value
        onChange={handleChange}
        placeholder="Enter file description..."
        maxLength={200} // Limit to 200 characters
      />
    </div>
  );
}
