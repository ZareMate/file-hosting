import type { Session } from "next-auth";

export const checkOwner = async (id: string , session: string) => {
  console.log("Session:", session);
  console.log("File ID:", id);
  if (session) {
    console.log("Session User ID:", session);
    console.log("File Owner ID:", id);
    return id === session;
  }
  return false;
}