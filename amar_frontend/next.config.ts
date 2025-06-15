// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  
  typescript: {
    ignoreBuildErrors: true, // ⚠️ ignora erros de TypeScript no build
  },
  images: {
    domains: ['localhost'],  // adiciona localhost aqui
  },
};

module.exports = nextConfig;
