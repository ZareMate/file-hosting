/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";



/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.0.0.1:3000",
    "http://files.suchodupin.com:3000",
    "https://files.suchodupin.com:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};




export default nextConfig;
