import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Allows testing the dev server from a phone/other device on the same
  // network (e.g. over Tailscale) — without this, Next.js blocks the HMR
  // websocket from any origin it doesn't recognize, which can leave the
  // page interactive-looking but with broken client-side event handlers.
  allowedDevOrigins: ["100.122.79.90", "100.65.227.53", "192.168.86.33"],
};

export default nextConfig;
