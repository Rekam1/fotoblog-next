/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'neu.christians.photo.christians.photo',
        pathname: '/sites/**',   // oder genauer: '/sites/default/files/**'
      },
    ],
  },
};

export default nextConfig;
