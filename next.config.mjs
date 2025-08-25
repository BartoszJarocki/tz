/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize problematic Node.js dependencies
      config.externals.push('discord.js', 'zlib-sync');
    }
    return config;
  },
};

export default nextConfig;
