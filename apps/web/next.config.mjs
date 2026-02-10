/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['lh.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    cacheComponents: true,
  },
};

export default nextConfig;
