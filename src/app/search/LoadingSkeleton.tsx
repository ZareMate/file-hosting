import React from "react";
import FilePlaceholder from "../_components/FilePlaceholder";

export default function LoadingSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {/* Top bar skeleton */}
      <div className="sticky top-0 z-10 w-full bg-[#2e026d] px-4 py-4 shadow-md">
        <div className="relative w-full max-w-md mx-auto">
          <div className="w-full h-12 bg-[#3b0764] rounded-full animate-pulse" />
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
        <FilePlaceholder />
      </div>
    </main>
  );
}