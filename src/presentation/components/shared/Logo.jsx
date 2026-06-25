"use client";

import Link from "next/link";
import Image from "next/image";

const sizeMap = {
  sm: { className: "h-10 w-10", width: 80, height: 80 },
  md: { className: "h-13 w-13", width: 104, height: 104 },
  lg: { className: "h-16 w-16", width: 128, height: 128 },
  xl: { className: "h-19 w-19", width: 152, height: 152 },
};

const Logo = ({ size = "md", className = "" }) => {
  const { className: sizeClass, width, height } = sizeMap[size] ?? sizeMap.md;
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center"
      aria-label="Hopping Deals home"
    >
      <Image
        src="/logo.png"
        alt="Hopping Deals"
        width={width}
        height={height}
        priority
        className={`${sizeClass} object-contain ${className}`.trim()}
      />
    </Link>
  );
};

export default Logo;
