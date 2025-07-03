"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FileGrid from "~/app/_components/FileGrid";
import UploadForm from "~/app/_components/UploadForm";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import FilePlaceholder from "./_components/FilePlaceholder";

// Custom fallback for FileGrid
function FileGridFallback() {
  return (
    <div className="grid w-full max-w-4xl animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="mb-2 text-lg text-white/60">Loading</span>
          <div className="h-32 w-full rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

// Custom fallback for UploadForm
function UploadFormFallback() {
  return (
    <div className="mt-8 flex w-full max-w-md animate-pulse flex-col gap-4">
      <div className="h-10 rounded bg-white/20" />
      <div className="h-10 rounded bg-white/10" />
    </div>
  );
}

function Home() {
  const [session, setSession] = useState<{ user?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
      setLoading(false);
    }
    fetchSession();
  }, []);

  return (
    <>
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
              <Suspense fallback={<FilePlaceholder />}>
                <FileGrid session={session as { user: { id: string } }} />
              </Suspense>
              <Suspense fallback={<UploadFormFallback />}>
                <UploadForm />
              </Suspense>
            </>
          ) : !loading ? (
            <p className="text-center text-2xl text-white">
              Please log in to upload and view files.
            </p>
          ) : null}
          {!session?.user && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-4">
                {!loading ? (
                  <Link
                    href={session ? "/api/auth/signout" : "/api/auth/signin"}
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                  >
                    {session ? "Sign out" : "Sign in"}
                  </Link>
                ) : (
                  <div className="flex h-10 items-center justify-center">
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
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Home;
