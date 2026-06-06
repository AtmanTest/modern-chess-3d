/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],

  // Stockfish lite-single-threaded does NOT need SharedArrayBuffer,
  // so no COOP/COEP headers required. Keeping default security.

  // Allow Web Workers for Stockfish
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
