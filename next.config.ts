import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/gas',
        destination: 'https://script.google.com/macros/s/AKfycbxlvP4m_u9njP07uizQ42BiurLLFpLrKt0QXmJxOMPG2I4M8QqfclsUSwNecD3t_9WXBg/exec',
      },
      {
        source: '/api/gas/:path*',
        destination: 'https://script.google.com/macros/s/AKfycbxlvP4m_u9njP07uizQ42BiurLLFpLrKt0QXmJxOMPG2I4M8QqfclsUSwNecD3t_9WXBg/exec/:path*',
      }
    ];
  },
};

export default nextConfig;