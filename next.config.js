/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!backendUrl) {
      return [];
    }

    const normalizedBackendUrl = backendUrl.replace(/\/+$/, '');

    return [
      {
        source: '/api/chat',
        destination: `${normalizedBackendUrl}/api/chat`,
      },
    ];
  },
};

module.exports = nextConfig;
