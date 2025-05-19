import React from 'react';

const LoadingSkeleton = () => (
  <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 animate-pulse">
    {/* Loading Title */}
    <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white mb-2">Loading</h1>
    {/* Title Skeleton */}
    <div className="h-16 w-80 rounded bg-white/20 mb-4" />
    {/* FileGrid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="mb-2 text-lg text-white/60">Loading</span>
          <div className="h-32 rounded bg-white/10 w-full" />
        </div>
      ))}
    </div>
    {/* UploadForm Skeleton */}
    <div className="mt-8 w-full max-w-md flex flex-col gap-4">
      <div className="h-10 rounded bg-white/20" />
      <div className="h-10 rounded bg-white/10" />
    </div>
  </div>
);

export default LoadingSkeleton;