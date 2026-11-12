import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRootDir = path.resolve(__dirname, "..");

/**
 * 1. Unified Official SentinelPay Icon Mark (Square 64x64 Scalable Vector)
 * 
 * Features:
 * - Electric Cobalt / Deep Slate gradient squircle tile
 * - Sleek micro-bevel border stroke
 * - Outer protective Sentinel Shield contour silhouette
 * - Unmistakable, mathematically balanced 'S' ribbon (pure silver-white crest
 *   transitioning through sky blue into glowing electric cyan)
 * - Tactile elevation drop shadow for high contrast across any backdrop
 */
export const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Background Gradient: Electric Blue into Deep Slate Cobalt -->
    <linearGradient id="sp-bg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="55%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- S-Ribbon Gradient: Pure White -> Sky Blue -> Electric Cyan -->
    <linearGradient id="sp-s" x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="38%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <!-- Cyan Shield Contour Gradient -->
    <linearGradient id="sp-cyan" x1="18" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <!-- Subtle Drop Shadow for depth -->
    <filter id="sp-depth" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0F172A" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Base Squircle with Subtle Micro-Stroke -->
  <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#sp-bg)" />
  <rect x="3.5" y="3.5" width="57" height="57" rx="15.5" stroke="white" stroke-opacity="0.22" stroke-width="1" />

  <!-- Outer Geometric Shield Silhouette Outline -->
  <path
    d="M 32 9.5 C 39.5 9.5 48 12.5 49 18.5 C 50.2 30.5 40 42.5 32 47.5 C 24 42.5 13.8 30.5 15 18.5 C 16 12.5 24.5 9.5 32 9.5 Z"
    stroke="url(#sp-cyan)"
    stroke-width="1.2"
    stroke-opacity="0.32"
    fill="none"
  />

  <!-- The Sentinel 'S' Ribbon: Unmistakable, Crisp, Balanced Monogram -->
  <path
    d="M 44 20 C 44 15.5 39 14 32 14 C 24 14 18 17 18 23.5 C 18 29 24 32 32 32 C 40 32 46 35 46 40.5 C 46 47 40 50 32 50 C 25 50 20 48.5 20 44"
    stroke="url(#sp-s)"
    stroke-width="7"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
    filter="url(#sp-depth)"
  />
</svg>
`;

/**
 * 2. Unified Favicon SVG — Exactly identical to the official icon mark.
 * Scalable for browser tabs (16x16, 32x32) and HiDPI displays.
 */
export const faviconSvg = iconSvg;

/**
 * 3. Horizontal Brand Logo Lockup with Wordmark & Official Tagline
 */
export const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 64" fill="none">
  <defs>
    <linearGradient id="logo-bg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="55%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="logo-s" x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="38%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>
    <linearGradient id="logo-cyan" x1="18" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>
    <filter id="logo-depth" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0F172A" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Left Icon Mark (Exact Match to SentinelIcon) -->
  <g transform="translate(4, 4)">
    <rect x="0" y="0" width="56" height="56" rx="15" fill="url(#logo-bg)" />
    <rect x="0.5" y="0.5" width="55" height="55" rx="14.5" stroke="white" stroke-opacity="0.22" stroke-width="1" />

    <!-- Outer shield contour -->
    <path
      d="M 28 8.5 C 34.5 8.5 42 11 43 16.5 C 44 27 35 37.5 28 42 C 21 37.5 12 27 13 16.5 C 14 11 21.5 8.5 28 8.5 Z"
      stroke="url(#logo-cyan)"
      stroke-width="1.2"
      stroke-opacity="0.32"
      fill="none"
    />

    <!-- The S Ribbon -->
    <path
      d="M 38.5 17.5 C 38.5 13.5 34 12 28 12 C 21 12 15.5 14.5 15.5 20.5 C 15.5 25.5 21 28 28 28 C 35 28 40.5 30.5 40.5 35.5 C 40.5 41.5 35 44 28 44 C 22 44 17.5 42.5 17.5 38.5"
      stroke="url(#logo-s)"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      filter="url(#logo-depth)"
    />
  </g>

  <!-- Brand Typography -->
  <g transform="translate(74, 18)">
    <!-- SentinelPay Text -->
    <text x="0" y="24" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5px" fill="#0F172A">
      Sentinel<tspan fill="#2563EB">Pay</tspan>
    </text>

    <!-- Subtitle / Tagline -->
    <g transform="translate(0, 31)">
      <text x="0" y="8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="600" letter-spacing="-0.2px" fill="#64748B">
        Trust Every Transaction. Control Every Agent.
      </text>
    </g>
  </g>
</svg>
`;

/**
 * Generates all brand assets into the designated directories.
 */
export function generateAssets(rootDir = defaultRootDir) {
  const publicDir = path.join(rootDir, "public");
  const appDir = path.join(rootDir, "app");

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });

  // Write SVGs to public/
  fs.writeFileSync(path.join(publicDir, "brand-icon.svg"), iconSvg.trim());
  fs.writeFileSync(path.join(publicDir, "logo.svg"), fullLogoSvg.trim());

  // Also write to app/ for Next.js 15 App Router standard favicon/icon discovery
  // User Requirement: Use the EXACT same icon as favicon, not separate!
  fs.writeFileSync(path.join(appDir, "icon.svg"), iconSvg.trim());

  return {
    brandIcon: path.join(publicDir, "brand-icon.svg"),
    logo: path.join(publicDir, "logo.svg"),
    appIcon: path.join(appDir, "icon.svg"),
  };
}

// Execute when invoked directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generateAssets();
  console.log("Successfully generated brand SVG assets:");
  console.log("- public/brand-icon.svg");
  console.log("- public/logo.svg");
  console.log("- app/icon.svg (Exact same icon as favicon)");
}
