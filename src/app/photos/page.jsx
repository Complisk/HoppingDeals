import Link from "next/link";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";

export const metadata = {
  title: "Photo Gallery",
  description:
    "How to install Complisk on your phone and get more out of the platform with a free account.",
  alternates: { canonical: "/photos" },
};

// Mirrors the live complisk.com/photos layout: two onboarding cards side
// by side. Left card is a mock phone home-screen showing the Complisk
// icon next to Instagram + Facebook with install instructions. Right
// card pitches signing up with an example Spring Fair flyer + a
// "Businesses tagged by you" widget.

function PhoneHomeScreenMock() {
  return (
    <div className="relative h-105 w-full rounded-2xl bg-black overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 110%, #2b2b2b 0%, #000 60%)",
        }}
      />
      {/* Tiny stars */}
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            top: `${(i * 37) % 80}%`,
            left: `${(i * 53) % 90}%`,
            width: i % 3 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 2 : 1,
            opacity: 0.4 + ((i * 17) % 60) / 100,
          }}
        />
      ))}
      {/* Moon */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 h-70 w-70 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #d8d8d8 0%, #6f6f6f 60%, #2a2a2a 100%)",
          boxShadow: "0 0 80px rgba(255,255,255,0.15)",
        }}
      />
      {/* App row */}
      <div className="relative z-10 mt-20 flex justify-center gap-10 px-6">
        <AppIcon
          label="Instagram"
          gradient="bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400"
          glyph={
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="white" />
            </svg>
          }
        />
        <AppIcon label="Complisk" custom>
          <span className="font-extrabold text-white text-sm tracking-tight">
            Complisk<span className="text-black bg-white px-0.5 ml-0.5 rounded-sm">-%</span>
          </span>
        </AppIcon>
        <AppIcon
          label="Facebook"
          gradient="bg-blue-600"
          glyph={
            <span className="text-white text-3xl font-bold leading-none">f</span>
          }
          badge="12"
        />
      </div>
    </div>
  );
}

function AppIcon({ label, gradient, glyph, custom = false, children, badge }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={
            "h-16 w-16 rounded-2xl flex items-center justify-center shadow-md " +
            (custom ? "bg-[#E31E24]" : gradient)
          }
        >
          {custom ? children : glyph}
        </div>
        {badge ? (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5.5 h-5.5 rounded-full bg-red-600 text-white text-xs font-semibold px-1.5">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-white text-sm">{label}</span>
    </div>
  );
}

function TaggedBusinessesMock() {
  const items = [
    { name: "D'Caesaro Pizza & Italian", phone: "(951) 687-0777", rating: "4.7 (1557)" },
    { name: "YoYo Burgers and Chicken", phone: "(833) 528-9696", rating: "4.7 (1167)" },
    { name: "The Boiling Crab", phone: "(714) 265-2722", rating: "4.6 (2052)" },
    { name: "TGI Fridays", phone: "(714) 978-3308", rating: "4.1 (2468)" },
  ];
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Businesses tag by you:</h4>
        <button
          type="button"
          aria-label="Add tagged business"
          className="h-6 w-6 rounded-full bg-red-600 text-white text-base leading-none"
        >
          +
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((b) => (
          <li
            key={b.name}
            className="flex items-center gap-3 rounded-lg border border-border p-2"
          >
            <div className="h-8 w-8 rounded bg-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{b.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                ({b.phone}) {b.rating}{" "}
                <span className="text-blue-600 underline">Website</span>
              </p>
            </div>
            <button className="text-muted-foreground hover:text-destructive" aria-label="Remove">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpringFairFlyer() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
      <div
        className="h-65 bg-linear-to-b from-sky-300 via-yellow-300 to-yellow-400 relative"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #38bdf8 0%, #fde047 60%, #fbbf24 100%)",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          <span className="text-[10px] font-bold tracking-wider text-white">
            46th Annual
          </span>
          <h3 className="text-3xl font-black text-red-600 leading-none drop-shadow-sm mt-1">
            LA SPRING FAIR
          </h3>
          <p className="text-xs font-bold text-white mt-2">THURS – SUN</p>
          <p className="text-sm font-extrabold text-white">APRIL 3–19, 2026</p>
          <span className="mt-3 inline-block bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
            BUY TICKETS NOW
          </span>
        </div>
        <span className="absolute top-2 left-2 bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
          FREE PARKING
        </span>
        <span className="absolute top-2 right-2 bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
          WE&apos;RE OPEN
          <br />
          THIS WEEKEND
        </span>
      </div>
      <div className="bg-white p-3 space-y-1.5 text-[11px]">
        <p className="font-semibold">📍 La Prada Events</p>
        <p className="text-muted-foreground">
          1600 NORTH Rosemead Boulevard, South El Monte, CA 91733
        </p>
        <p className="text-muted-foreground">
          🚩 LA SPRING FAIR 2026 is HERE — Let the fun begin!
        </p>
        <p className="text-muted-foreground">
          📅 Whittier Narrows Recreation Park · April 9–19 (Thurs–S…
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left card — installation guide */}
            <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <PhoneHomeScreenMock />
              <div className="mt-5 space-y-2">
                <h2 className="text-xl font-bold">
                  Complisk app installation guide
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To get the Complisk icon on phone. Simply open the website,
                  tap the share button (box with upward arrow), scroll down,
                  and select &ldquo;Add to Home Screen&rdquo;.
                </p>
              </div>
            </article>

            {/* Right card — sign up for better experience */}
            <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SpringFairFlyer />
                <div className="space-y-3">
                  <p className="text-xs font-bold leading-snug">
                    Tag your favorite local businesses that you would like to
                    see deals from (Name + location)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Once we have enough users &ldquo;tagged,&rdquo; we will
                    reach out to that business to join Complisk!
                  </p>
                  <TaggedBusinessesMock />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <h2 className="text-xl font-bold">Sign up for better experience!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign up for a better experience with Complisk. Tag some of
                  your favorite business and save promotions that interest
                  you.
                </p>
              </div>
            </article>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              Create your free account →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
