import React from "react";

interface VedaLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official VEDA Intelligence Brand Mark (SVG Vector)
 * Geometrically accurate rendering from vedaintelligence.com:
 * - Blue diagonal left chevron stroke (#1873e8)
 * - Green diagonal right chevron stroke (#10a64b)
 * - Red convergence accent circle (#ed4839)
 */
export function VedaLogoIcon({ className = "w-7 h-7", size }: VedaLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VEDA Intelligence Logo"
    >
      <path d="M5 7h15l14 34-10 15z" fill="#1873e8" />
      <path d="M59 7H44L30 41l10 15z" fill="#10a64b" />
      <circle cx="32" cy="56" r="6" fill="#ed4839" />
    </svg>
  );
}

export default VedaLogoIcon;
