import { redirect } from "next/navigation";
import { signIn, auth, providerMap } from "~/server/auth_custom";
import { AuthError } from "next-auth";
import { HomeButton } from "~/app/_components/HomeButton";

const SIGNIN_ERROR_URL = "/error";

export default async function SignInPage(props: {
//   searchParams: { callbackUrl: string | undefined };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="absolute top-4 left-4 z-20">
        <HomeButton />
      </div>
      <div className="flex flex-col gap-2 items-center justify-center ">
        {/* <form
            action={async (formData) => {
            "use server"
            try {
                await signIn("credentials", formData)
            } catch (error) {
                if (error instanceof AuthError) {
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                }
                throw error
            }
            }}
        >
            <label htmlFor="email">
            Email
            <input name="email" id="email" />
            </label>
            <label htmlFor="password">
            Password
            <input name="password" id="password" />
            </label>
            <input type="submit" value="Sign In" />
        </form> */}
        {Object.values(providerMap).map((provider) => (
          <form
            key={provider.id}
            action={async () => {
              "use server";
              try {
                await signIn(provider.id, {
                  redirectTo: "/",
                });
              } catch (error) {
                // Signin can fail for a number of reasons, such as the user
                // not existing, or the user not having the correct role.
                // In some cases, you may want to redirect to a custom error
                if (error instanceof AuthError) {
                  return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
                }

                // Otherwise if a redirects happens Next.js can handle it
                // so you can just re-thrown the error and let Next.js handle it.
                // Docs:
                // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                throw error;
              }
            }}
          >
            <button
              type="submit"
              className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
            >
              <span className="flex items-center">
                Sign in with {provider.name}
                <img
                  loading="lazy"
                  height="24"
                  width="24"
                  className="ml-3 inline-block"
                  src={`https://authjs.dev/img/providers/${provider.name.toLowerCase()}.svg`}
                  alt={`${provider.name} logo`}
                />
              </span>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
