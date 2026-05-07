/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "cdn.watchmode.com" },
      { protocol: "https", hostname: "**" }
    ]
  }
};
export default nextConfig;
