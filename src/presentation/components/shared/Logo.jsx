"use client";

import Link from "next/link";
import Image from "next/image";

const sizeMap = {
  sm: { className: "h-6 w-auto", width: 122, height: 60 },
  md: { className: "h-8 w-auto", width: 162, height: 80 },
  lg: { className: "h-10 w-auto", width: 203, height: 100 },
  xl: { className: "h-12 w-auto", width: 244, height: 120 },
};

const Logo = ({ size = "md", className = "" }) => {
  const { className: sizeClass, width, height } = sizeMap[size] ?? sizeMap.md;
  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label="Complisk home"
    >
      <Image
        src="/complisk-logo.png"
        alt="Complisk"
        width={width}
        height={height}
        priority
        className={`${sizeClass} ${className}`.trim()}
      />
    </Link>
  );
};

export default Logo;
