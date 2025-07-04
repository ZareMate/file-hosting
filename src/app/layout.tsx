import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "File Hosting - Suchodupin",
  description: "A simple file hosting service",
  authors: [{ name: "Suchodupin" }],
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        {process.env.NODE_ENV === "development" && (
          // Display a banner in development mode
          // make it slanted 45 degrees and red
          // make it in the top left corner
            <div
              style={{
              position: "fixed",
              top: "40px", // moved down a little
              left: 0,
              width: "100vw",
              height: "60px",
              backgroundColor: "red",
              color: "white",
              display: "flex",
              alignItems: "center",
              paddingLeft: "20px",
              transform: "rotate(-45deg) translate(-30px, -30px)",
              transformOrigin: "top left",
              zIndex: 4, // below normal
              pointerEvents: "none",
              userSelect: "none",
              }}
            >
              <span style={{ marginLeft: "15px", marginRight: "15px", marginTop: "10px" }}>DEV</span>
            </div>
        )}
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
