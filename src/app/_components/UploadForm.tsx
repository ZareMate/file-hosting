"use client";

import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { notifyClients } from "~/utils/notifyClients";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Track upload progress
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input
  const [isDragActive, setIsDragActive] = useState(false); // Track drag state

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0] ?? null);
      setUploadedFileUrl(null); // Reset the uploaded file URL when a new file is selected
      setProgress(0); // Reset progress
      setUploading(false); // Reset uploading state
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0] ?? null);
      setUploadedFileUrl(null);
      setProgress(0);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          const response = JSON.parse(xhr.responseText);
          setUploadedFileUrl(response.file?.url || null); // Use the new response structure
          toast.success("File uploaded successfully!");

          // Clear the file input and reset state
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
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

      {/* Drag and Drop Area */}
      <div
        className={`w-full max-w-md flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 mb-2 transition-colors duration-200 ${isDragActive ? "border-blue-500 bg-blue-100/30" : "border-gray-400 bg-transparent hover:bg-gray-50/10"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: "pointer" }}
      >
        {/* Hidden file input for click-to-select */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <span className="text-gray-300">
          {isDragActive ? "Drop your file here" : "Drag & drop a file here, or click to select"}
        </span>
        {file && (
          <div className="mt-2 flex items-center gap-2">
        <span className="text-green-500 font-semibold">{file.name}</span>
        {/* Add button to remove file */}
        <button
          onClick={e => {
            e.stopPropagation();
            setFile(null);
            if (fileInputRef.current) {
          fileInputRef.current.value = "";
            }
          }}
          className="flex items-center justify-center rounded-full bg-red-500 p-2 hover:bg-red-700"
          style={{ cursor: "pointer" }}
        >
          <img src="/icons/delete.svg" alt="Remove" className="h-6 w-6" />
        </button>
          </div>
        )}
      </div>
      {/* Show upload button only when file is selected */}
      {file && (
      <div className="flex flex-row items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>)}

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

      {/* {uploadedFileUrl && file && (
        <div className="flex flex-row items-center gap-4">
          <p className="text-white">{file.name}</p>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600"
          >
            <img src="/icons/copy.svg" alt="Copy URL" className="h-6 w-6" />
          </button>
        </div>
      )} */}
    </div>
  );
}