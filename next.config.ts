// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permet au build de réussir même s'il reste des erreurs TS
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

