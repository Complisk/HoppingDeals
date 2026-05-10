"use client";

// Wraps next/image with a Cloudinary URL builder.
//
// Why this exists: the old version used the Cloudinary React SDK
// (@cloudinary/react) with the responsive() + lazyload() plugins. That
// re-measured every container on each render and re-requested the image
// at the new width — slow with a grid of 30+ cards. Switching to
// next/image gives us:
//   - automatic WebP/AVIF (Cloudinary's f_auto + Next's <Image>)
//   - responsive srcset and sizes (Next handles it)
//   - native lazy-loading
//   - one URL per card, cached cleanly by the browser
//
// We pass `cloud_name` + `public_id` and build the URL ourselves with
// transforms baked in (f_auto = auto format, q_auto = auto quality,
// w_600 = 600px wide, c_fill + ar_4:3 = crop to a 4:3 box). 600px @ 2x
// retina = 1200px source, plenty for any of the cards on the homepage.
//
// We render our own positioned wrapper around <Image fill> so callers
// don't need to remember to set `relative` on their parent.

import Image from "next/image";

const CLOUD_NAME = "dgdfenqsv";

function buildUrl(publicId, { width = 600, ar = "4:3" } = {}) {
  if (!publicId) return null;
  // f_auto picks WebP/AVIF where supported, q_auto picks compression by
  // network/device, c_fill+ar crops to the requested aspect ratio.
  const transforms = `f_auto,q_auto,w_${width},c_fill,ar_${ar}`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

export default function OptimizeImage({
  publicId,
  alt = "",
  width = 600,
  ar = "4:3",
  priority = false,
  className = "",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}) {
  const src = buildUrl(publicId, { width, ar });
  if (!src) return null;

  // The wrapper is what defines the box <Image fill> measures itself
  // against. We default to filling the parent (w-full h-full) but let
  // callers pass extra height/width hints through `className` — e.g.
  // "h-40 w-full" from AdminTemplateUpload — so existing callers don't
  // need to be touched.
  const wrapperClass = `relative w-full h-full ${className}`.trim();

  return (
    <div className={wrapperClass}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
