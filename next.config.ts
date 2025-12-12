import type { NextConfig } from "next";

const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "http://localhost:8080";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline'; frame-src https://hcaptcha.com https://*.hcaptcha.com; connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com ${backendHost}` },
        ],
      },
    ];
  },
};

export default nextConfig;
