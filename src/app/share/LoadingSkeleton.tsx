import React, { Suspense } from "react";
import { HomeButton } from "~/app/_components/HomeButton"; // Import the client component
import { Toaster } from "react-hot-toast";
import {
  FileActionsContainer,
} from "~/app/_components/ActionButtons"; // Import the client component

const LoadingSkeleton: React.FC = () => (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="absolute top-4 left-4">
         <HomeButton />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container flex flex-col items-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">File</span> Details
        </h1>
        <div className="mt-6">
          {" Loading..."}
        </div>
        <div className="w-full max-w-md rounded-lg bg-white/10 p-6 text-white shadow-md">
          <p>
            <strong>Name:</strong>{" Loading..."}
          </p>
          <p>
            <strong>Size:</strong>{" Loading..."}
          </p>
          <p>
            <strong>Owner:</strong>{" Loading..."}
          </p>
          <p>
            <strong>Upload Date:</strong>{" Loading..."}
          </p>
          <div>
            <strong>Description:</strong>{" Loading..."}
          </div>
          <div className="mt-4 flex justify-center">
            <FileActionsContainer
              fileId={""}
              fileName={""}
              fileUrl={""}
              isOwner={false}
              isPublic={false}
            />
          </div>
        </div>
      </div>
    </main>
);

export default LoadingSkeleton;