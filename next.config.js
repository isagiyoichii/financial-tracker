/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image domains for Next.js Image component
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google user photos (for Google sign-in)
      'firebasestorage.googleapis.com', // Firebase storage
      'financial-tracker-hehe.firebasestorage.app' // Project-specific storage
    ],
  },
};

module.exports = nextConfig; 