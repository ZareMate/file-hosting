import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import FileGrid from "~/app/_components/FileGrid";
import UploadForm from "~/app/_components/UploadForm";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import LoadingSkeleton from "./LoadingSkeleton";

// Custom fallback for FileGrid
function FileGridFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="mb-2 text-lg text-white/60">Loading</span>
          <div className="h-32 rounded bg-white/10 w-full" />
        </div>
      ))}
    </div>
  );
}

// Custom fallback for UploadForm
function UploadFormFallback() {
  return (
    <div className="mt-8 w-full max-w-md flex flex-col gap-4 animate-pulse">
      <div className="h-10 rounded bg-white/20" />
      <div className="h-10 rounded bg-white/10" />
    </div>
  );
}

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <Toaster position="top-right" reverseOrder={false} />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {/* Top-right corner sign-out button */}
        {session?.user && (
          <div className="absolute top-4 right-4 flex items-center gap-4">
            {/* Search Button */}
            <Link
              href="/search"
              className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M16.65 10.65a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </Link>

            <Link
              href="/api/auth/signout"
              className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
            >
              Sign out
            </Link>
          </div>
        )}

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">File</span> Hosting
          </h1>
          {/* Conditionally render FileGrid and UploadForm if the user is logged in */}
          {session?.user ? (
            <>
              <Suspense fallback={<FileGridFallback />}>
                <FileGrid session={session} />
              </Suspense>
              <Suspense fallback={<UploadFormFallback />}>
                <UploadForm />
              </Suspense>
            </>
          ) : (
            <p className="text-center text-2xl text-white">
              Please log in to upload and view files.
            </p>
          )}
          {!session?.user && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-4">
                <Link
                  href={session ? "/api/auth/signout" : "/api/auth/signin"}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
