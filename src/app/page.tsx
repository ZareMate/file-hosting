import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import FileGrid from "~/app/_components/FileGrid";
import UploadForm from "~/app/_components/UploadForm";
import { Toaster } from "react-hot-toast";

export default async function Home() {
  const session = await auth();


  return (
    <HydrateClient>
      <Toaster position="top-right" reverseOrder={false} />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {/* Top-right corner sign-out button */}
        {session?.user && (
          <div className="absolute top-4 right-4">
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
              <FileGrid session={session} />
              <UploadForm/>
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
