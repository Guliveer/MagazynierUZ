import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
                https://hcaptcha.com
                https://*.hcaptcha.com;
              style-src 'self' 'unsafe-inline';
              frame-src
                https://hcaptcha.com
                https://*.hcaptcha.com;
              connect-src 'self'
                https://hcaptcha.com
                https://*.hcaptcha.com
                https://*.herokuapp.com
                ${backendHost};
              img-src 'self' data:
                https://a.tile.openstreetmap.org
                https://b.tile.openstreetmap.org
                https://c.tile.openstreetmap.org
                https://*.openstreetmap.org
                https://hcaptcha.com
                https://*.hcaptcha.com
                https://imgs.hcaptcha.com
                https://imgs3.hcaptcha.com;
              media-src 'self'
                https://hcaptcha.com
                https://*.hcaptcha.com
                https://imgs.hcaptcha.com
                https://imgs3.hcaptcha.com;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
