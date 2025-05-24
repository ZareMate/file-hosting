import toast from "react-hot-toast";
import { env } from "~/env.js";
import { notifyClients } from "~/utils/notifyClients";

export const useFileActions = (
  setFiles: (callback: (prevFiles: any[]) => any[]) => void,
  setDescription?: (description: string) => undefined,
  fileId?: string
) => {
  const pageUrl = `${env.NEXT_PUBLIC_PAGE_URL}`;

  // Handle file download
  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      toast.loading(`Downloading file "${fileName}"...`, { id: "download" });
      const response = await fetch(
        `/api/files/download?fileId=${encodeURIComponent(fileId)}&fileName=${encodeURIComponent(fileName)}`
      );
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss("download");
      toast.success(`File "${fileName}" downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.dismiss("download");
      toast.error("Failed to download file.");
    }
  };

  // Copy file URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(pageUrl + url)
      .then(() => toast.success("File URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  // Remove a file
  const handleRemove = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId }),
      });

      if (response.status === 403) {
        toast.error("You are not authorized to remove this file.");
        return;
      }

      if (!response.ok) throw new Error("Failed to delete file");

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.success("File removed successfully!");
      // Go to the home page after removing the file
      window.location.href = `${pageUrl}/`;
      notifyClients({ type: "file-removed", fileId });

    } catch (err) {
      console.error(err);
      toast.error("Failed to remove file.");
    }
  };

  // Handle description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    debounceTimer: React.RefObject<NodeJS.Timeout | null>
  ) => {
    if (setDescription === undefined) {console.error("setDescription function is not provided") 
      return;
    };

    const newDescription = e.target.value;
    setDescription(newDescription);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      console.log("Calling handleDescriptionSave"); // Debug log
      handleDescriptionSave(newDescription);
    }, 1000);
  };

  // Save updated description
  const handleDescriptionSave = async (description: string) => {
    if (!fileId) {
      toast.error("File ID is required.");
      return;
    }

    try {
      const response = await fetch(`/api/files/share?id=${encodeURIComponent(fileId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // pass the fileId and description in the request body
        body: JSON.stringify({ description, id: fileId }),
      });

      if (response.status === 403) {
        toast.error("You are not authorized to modify this file's description.");
        return;
      }

      if (!response.ok) throw new Error("Failed to update description");

      toast.success("Description updated successfully!");
      notifyClients({ type: "file-updated", fileId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update description.");
    }
  };

  return {
    handleDownload,
    handleCopyUrl,
    handleRemove,
    handleDescriptionChange,
    handleDescriptionSave,
  };
};