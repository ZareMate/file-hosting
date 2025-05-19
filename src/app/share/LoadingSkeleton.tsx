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
          <svg
                      className="h-6 w-6 animate-spin text-white/70"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
        </div>
        <div className="w-full max-w-md rounded-lg bg-white/10 p-6 text-white shadow-md">
          <p>
            <strong>Name:</strong> <span className="inline-block h-6 w-24 rounded bg-white/20 animate-pulse align-middle ml-2" />
          </p>
          <p>
            <strong>Size:</strong> <span className="inline-block h-6 w-16 rounded bg-white/20 animate-pulse align-middle ml-2" />
          </p>
          <p>
            <strong>Owner:</strong> <span className="inline-block h-6 w-20 rounded bg-white/20 animate-pulse align-middle ml-2" />
          </p>
          <p>
            <strong>Upload Date:</strong> <span className="inline-block h-6 w-28 rounded bg-white/20 animate-pulse align-middle ml-2" />
          </p>
          <div>
            <strong>Description:</strong> <span className="inline-block h-6 w-40 rounded bg-white/20 animate-pulse align-middle ml-2" />
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