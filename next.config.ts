/** @type {import('next').NextConfig} */
const nextConfig = {
  // === ⬇️ ADD THIS ENTIRE 'images' BLOCK ⬇️ ===
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
    ],
  },
  // === ⬆️ END OF ADDITION ⬆️ ===
};

export default nextConfig;