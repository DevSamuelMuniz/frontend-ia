/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desativa o ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desativa a checagem de tipos do TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
