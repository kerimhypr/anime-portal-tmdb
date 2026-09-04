/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};
export default nextConfig;
