"use client";

import React, { useId } from "react";

export interface SentinelIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  variant?: "primary" | "slate" | "white" | "ghost";
}

/**
 * SentinelIcon: The official geometric logo mark for SentinelPay.
 * Features an electric blue squircle shield tile with an interlocking
 * 'S' & 'P' cryptographic enclave ribbon and cyan security core.
 */
export function SentinelIcon({
  size = 36,
  className = "",
  variant = "primary",
  ...props
}: SentinelIconProps) {
  const rawId = useId();
  // Sanitize id for SVG url(#...) reference
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const bgId = `sl-bg-${safeId}`;
  const slateBgId = `sl-slate-${safeId}`;
  const cyanId = `sl-cyan-${safeId}`;
  const shadowId = `sl-shadow-${safeId}`;

  const isSlate = variant === "slate";
  const isWhite = variant === "white";
  const isGhost = variant === "ghost";
  const sGradId = `sl-s-${safeId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${className}`}
      {...props}
    >
      <defs>
        {/* Primary Electric Blue into Deep Cobalt Gradient */}
        <linearGradient id={bgId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="55%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Slate Variant Gradient */}
        <linearGradient id={slateBgId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* S-Ribbon Gradient: Pure White -> Sky Blue -> Electric Cyan */}
        <linearGradient id={sGradId} x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="38%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>

        {/* Cyan Enclave Core Glow */}
        <linearGradient id={cyanId} x1="18" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>

        {/* Drop shadow for ribbon elevation */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Base Squircle Tile (Omitted in ghost mode) */}
      {!isGhost && (
        <>
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill={isWhite ? "#FFFFFF" : isSlate ? `url(#${slateBgId})` : `url(#${bgId})`}
          />
          <rect
            x="3.5"
            y="3.5"
            width="57"
            height="57"
            rx="15.5"
            stroke={isWhite ? "#E2E8F0" : "white"}
            strokeOpacity={isWhite ? 1 : 0.22}
            strokeWidth="1"
          />
        </>
      )}

      {/* Outer Geometric Shield Silhouette Outline */}
      <path
        d="M 32 9.5 C 39.5 9.5 48 12.5 49 18.5 C 50.2 30.5 40 42.5 32 47.5 C 24 42.5 13.8 30.5 15 18.5 C 16 12.5 24.5 9.5 32 9.5 Z"
        stroke={isWhite ? "#2563EB" : `url(#${cyanId})`}
        strokeWidth="1.2"
        strokeOpacity={isWhite ? 0.25 : 0.32}
        fill="none"
      />

      {/* The Sentinel "S" Ribbon: Unmistakable, Crisp, Modern Monogram */}
      <path
        d="M 44 20 C 44 15.5 39 14 32 14 C 24 14 18 17 18 23.5 C 18 29 24 32 32 32 C 40 32 46 35 46 40.5 C 46 47 40 50 32 50 C 25 50 20 48.5 20 44"
        stroke={isWhite ? "#0F172A" : `url(#${sGradId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${shadowId})`}
      />
    </svg>
  );
}

export interface SentinelLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  iconVariant?: "primary" | "slate" | "white";
  tagline?: string;
}

/**
 * SentinelLogo: Full horizontal brand lockup with custom vector mark
 * and crisp typography.
 */
export function SentinelLogo({
  size = "md",
  showSubtitle = true,
  className = "",
  onClick,
  iconVariant = "primary",
  tagline = "Trust Every Transaction. Control Every Agent.",
  ...rest
}: SentinelLogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const subSize = size === "sm" ? "text-[8.5px]" : size === "lg" ? "text-[11px]" : "text-[10px]";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 ${onClick ? "cursor-pointer group" : ""} ${className}`}
      {...rest}
    >
      <SentinelIcon
        size={iconSize}
        variant={iconVariant}
        className={onClick ? "group-hover:scale-105" : ""}
      />

      <div className="flex flex-col min-w-0">
        <span className={`${textSize} font-bold tracking-tight text-[#0F172A] leading-tight flex items-center`}>
          Sentinel<span className="text-[#2563EB]">Pay</span>
        </span>
        {showSubtitle && (
          <span className={`${subSize} font-medium text-gray-500 leading-tight mt-0.5 tracking-tight`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
