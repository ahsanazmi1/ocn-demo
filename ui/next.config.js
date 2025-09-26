/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    rewrites: async () => [
        {
            source: '/api/:path*',
            destination: 'http://gateway:8090/:path*',
        },
    ],
}

module.exports = nextConfig
