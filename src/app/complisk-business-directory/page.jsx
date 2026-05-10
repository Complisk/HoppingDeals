import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";

export const metadata = {
  title: "Complisk Business Directory",
  description:
    "Support Local with Complisk! Discover the incredible businesses that power our platform.",
  alternates: { canonical: "/complisk-business-directory" },
};

function DirectoryMap({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="Illustration of local businesses on a city map"
    >
      <rect x="0" y="0" width="800" height="500" fill="#E6F5F4" />
      {/* roads */}
      <g stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round">
        <line x1="0" y1="120" x2="800" y2="120" />
        <line x1="0" y1="260" x2="800" y2="260" />
        <line x1="0" y1="400" x2="800" y2="400" />
        <line x1="160" y1="0" x2="160" y2="500" />
        <line x1="400" y1="0" x2="400" y2="500" />
        <line x1="640" y1="0" x2="640" y2="500" />
      </g>
      <g stroke="#CFE9E6" strokeWidth="2" strokeDasharray="6 6">
        <line x1="0" y1="120" x2="800" y2="120" />
        <line x1="0" y1="260" x2="800" y2="260" />
        <line x1="0" y1="400" x2="800" y2="400" />
        <line x1="160" y1="0" x2="160" y2="500" />
        <line x1="400" y1="0" x2="400" y2="500" />
        <line x1="640" y1="0" x2="640" y2="500" />
      </g>
      {/* center pin (large) */}
      <g transform="translate(400 230)">
        <path
          d="M0 0 C-40 0 -60 -32 -60 -64 C-60 -96 -32 -120 0 -120 C32 -120 60 -96 60 -64 C60 -32 40 0 0 0 Z"
          fill="#E11D2E"
        />
        <circle cx="0" cy="-66" r="22" fill="#FFFFFF" />
      </g>
      {/* small pins */}
      <g fill="#E11D2E">
        <circle cx="200" cy="160" r="14" />
        <path d="M200 188 L188 160 L212 160 Z" />
        <circle cx="640" cy="100" r="14" />
        <path d="M640 128 L628 100 L652 100 Z" />
        <circle cx="120" cy="380" r="14" />
        <path d="M120 408 L108 380 L132 380 Z" />
        <circle cx="700" cy="380" r="14" />
        <path d="M700 408 L688 380 L712 380 Z" />
      </g>
      {/* storefront center */}
      <g transform="translate(360 280)">
        <rect x="0" y="30" width="120" height="80" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="2" />
        <rect x="0" y="20" width="120" height="20" fill="#E11D2E" />
        <rect x="0" y="6" width="120" height="14" fill="#1F1F1F" />
        <text x="60" y="17" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="700">STORE</text>
        <g fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="1.5">
          <rect x="14" y="44" width="32" height="48" />
          <rect x="74" y="44" width="32" height="36" />
        </g>
        <g stroke="#E11D2E" strokeWidth="3">
          <line x1="14" y1="44" x2="46" y2="44" />
          <line x1="74" y1="44" x2="106" y2="44" />
        </g>
      </g>
      {/* small storefront left */}
      <g transform="translate(70 380)">
        <rect x="0" y="20" width="80" height="56" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="2" />
        <rect x="0" y="10" width="80" height="14" fill="#E11D2E" />
        <rect x="10" y="32" width="22" height="32" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="1.5" />
        <rect x="48" y="32" width="22" height="22" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="1.5" />
      </g>
      {/* small storefront right */}
      <g transform="translate(640 100)">
        <rect x="0" y="20" width="80" height="56" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="2" />
        <rect x="0" y="10" width="80" height="14" fill="#E11D2E" />
        <rect x="10" y="32" width="22" height="32" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="1.5" />
        <rect x="48" y="32" width="22" height="22" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8">
            Complisk Business Directory
          </h1>
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-12">
            Support Local with Complisk! Discover the incredible businesses
            that power our platform. Whether they have already shared exclusive
            offers with our users or are gearing up for future launches, these
            merchants are committed to excellence. Join us in championing local
            entrepreneurship.
          </p>

          <div className="rounded-lg overflow-hidden">
            <DirectoryMap className="w-full h-auto" />
          </div>

          <div className="mt-10 border-t border-primary pt-6">
            <p className="text-center text-2xl md:text-3xl font-extrabold text-primary tracking-wide">
              COMING SOON
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
