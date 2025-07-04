import { signOut } from "~/server/auth_custom";
import { HomeButton } from "~/app/_components/HomeButton";
import { redirect } from "next/navigation";

// Define the server action outside the component
async function signOutAction() {
  "use server";
  await signOut({
    redirectTo: "/",
  });
}

export default function SignOutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="absolute top-4 left-4 z-20">
        <HomeButton />
      </div>
      
      <div className="">
        {/* Add some tailwind css */}
        <h5 className="text-2xl font-bold mb-4 text-center text-white">Are you sure you want to sign out?</h5>
        {/* Center verticaly */}
        <form action={signOutAction} className="items-center justify-center flex flex-col gap-4 ">
          <button type="submit" className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">Sign out</button>
        </form>
      </div>
    </main>
  );
}
