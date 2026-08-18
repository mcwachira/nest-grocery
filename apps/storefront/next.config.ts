/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for apps/storefront/Dockerfile's "runner" stage: this makes
    // Next.js emit a minimal self-contained server into .next/standalone,
    // which is the only thing copied into the production image.
    output: "standalone",

    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "via.placeholder.com",
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc", // you also used this in avatars
            },
        ],
    },
};
export default nextConfig;
