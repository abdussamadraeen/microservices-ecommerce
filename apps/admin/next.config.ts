import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types", "@repo/order-db", "@repo/product-db"],
  serverExternalPackages: ["mongoose", "mongodb", "@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
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
      }
    ]
  }
};

export default nextConfig;
