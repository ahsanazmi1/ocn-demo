/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    env: {
        GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8090',
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.GATEWAY_URL || 'http://localhost:8090'}/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
