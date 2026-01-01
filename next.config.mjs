/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placedog.net',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '172.105.24.93', // Linode IP
            },
            {
                protocol: 'https',
                hostname: '**', // Allow others for now since user pastes URLs
            }
        ],
    },
};

export default nextConfig;
