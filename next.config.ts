import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.catbox.moe',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // Adicionado para permitir requisições de origens diferentes no ambiente de desenvolvimento em nuvem.
    allowedDevOrigins: [
      '6000-firebase-studio-1767009620080.cluster-udxxdyopu5c7cwhhtg6mmadhvs.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
