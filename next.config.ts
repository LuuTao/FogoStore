import type { NextConfig } from "next";

const API_TARGET = process.env.NEXT_PUBLIC_API_URL || "https://fogo-store-api.onrender.com";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fogo-store-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.hstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'product.hstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'theme.hstatic.net',
      },
    ],
  },
  // 1. Cấu hình Security Headers bảo vệ trang web
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Chống MIME-sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Chống lồng iframe trái phép (Clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Chặn script độc hại trên các trình duyệt cũ
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Giới hạn rò rỉ URL nguồn khi điều hướng sang trang khác
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Chặn quyền truy cập thiết bị không dùng đến
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // 2. Chuyển hướng API an toàn sang Render Backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;