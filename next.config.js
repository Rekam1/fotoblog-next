/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'neu.christians.photo.christians.photo' },
    ],
  },
};

module.exports = nextConfig;
