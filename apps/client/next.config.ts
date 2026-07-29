import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@react-three/drei",
    "@react-three/fiber",
    "three",
    "@repo/types",
    "@repo/order-db",
    "@repo/product-db",
    "@repo/kafka"
  ],
  serverExternalPackages: ["mongoose", "mongodb", "@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i01.appmifile.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
