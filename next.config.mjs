/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs", "mongodb", "chromadb", "pdf-parse"],
  },
};

export default nextConfig;
