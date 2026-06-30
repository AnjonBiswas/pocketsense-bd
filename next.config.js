const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

function assertPublicEnv(name, value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (
    !value ||
    normalized.startsWith("your_") ||
    normalized.includes("your-project-ref") ||
    normalized.includes("placeholder") ||
    normalized.includes("example")
  ) {
    throw new Error(`${name} must be configured before building PocketSense BD.`);
  }
}

assertPublicEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
assertPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co"
      }
    ]
  }
};

module.exports = withBundleAnalyzer(nextConfig);
