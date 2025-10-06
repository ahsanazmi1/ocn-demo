/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // rewrites: async () => [
    //     {
    //         source: '/api/gateway/:path*',
    //         destination: 'http://demo1-gateway:8090/:path*',
    //     },
    // ],
}

module.exports = nextConfig
