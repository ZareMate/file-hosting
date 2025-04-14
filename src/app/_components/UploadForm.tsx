"use client";

import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Track upload progress
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0] ?? null);
      setUploadedFileUrl(null); // Reset the uploaded file URL when a new file is selected
      setProgress(0); // Reset progress
      setUploading(false); // Reset uploading state
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file to upload.");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response: { url: string } = JSON.parse(xhr.responseText); // Explicitly type the response
          setUploadedFileUrl(response.url); // Assume the API returns the uploaded file URL
          toast.success("File uploaded successfully!");

          // Clear the file input and reset state
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
          }
        } else {
          console.error("Upload failed:", xhr.responseText);
          toast.error("Failed to upload file.");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        console.error("Upload failed");
        toast.error("Failed to upload file.");
        setUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (uploadedFileUrl) {
      navigator.clipboard
        .writeText(uploadedFileUrl)
        .then(() => toast.success("File URL copied to clipboard!"))
        .catch(() => toast.error("Failed to copy URL."));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-row items-center gap-4">
        {/* Custom file input */}
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {file ? (
            <>
              File Selected
              {/* SVG Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          ) : (
            "Select File"
          )}
        </label>
        <input
          id="file-upload"
          ref={fileInputRef} // Attach the ref to the file input
          type="file"
          onChange={handleFileChange}
          className="hidden" // Hide the default file input
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && uploading && (
        <div className="w-full max-w-md flex items-center gap-2">
          <div className="relative h-5 flex-1 rounded-full bg-gray-200">
            <div
              className="absolute h-5 rounded-full bg-blue-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {uploadedFileUrl && (
        <div className="flex flex-row items-center gap-4">
          <p className="text-white">{uploadedFileUrl}</p>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600"
          >
            {/* Copy Icon */}
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
                d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}