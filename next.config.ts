import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Resume uploads go through a Server Action. Files are capped at 4 MB;
      // the extra 64 KB covers form-upload overhead.
      bodySizeLimit: 4 * 1024 * 1024 + 64 * 1024,
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
