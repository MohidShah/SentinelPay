import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships native bindings; load it from node_modules at runtime instead of bundling.
  serverExternalPackages: ["@libsql/client", "@libsql/core", "@libsql/hrana-client", "@libsql/isomorphic-ws", "libsql"],
};

export default nextConfig;
