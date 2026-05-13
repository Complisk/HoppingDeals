"use client";

// CategoryStreet — the homepage cityscape with draggable buildings, animated
// car + airplane, day/night background, sun/moon, and clouds.
//
// Reverse-engineered from the production bundle on complisk.com because the
// original source was never committed back to GitHub. Behaviour mirrors what
// I could observe in the live deployment:
//   - 18 building tiles, each linking to /category/<slug>
//   - per-image scale + Y-offset adjustments so each illustration sits on the
//     ground at the right size (the original source had hand-tuned tables)
//   - sun (06:00–19:59) vs moon background, swapped every minute
//   - clouds shown during the day only
//   - drag-to-scroll with inertia + momentum decay
//   - left/right arrow buttons that animate-scroll by ~300px and flip the
//     direction of the car/airplane to match
//   - airplane drifts horizontally across the sky on a requestAnimationFrame
//     loop; car stays parked but flips left/right with scroll direction

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BUILDINGS = [
  { id: "Restaurants", link: "restaurants,food", src: "/new-assets/10.webp", alt: "Market" },
  { id: "Beauty & Spas", link: "beauty-&-spas", src: "/barber.png", alt: "Pizzeria" },
  { id: "Home Services", link: "home-services", src: "/new-assets/5.webp", alt: "Bakery" },
  { id: "Coffee & Tea", link: "coffee-&-tea", src: "/new-assets/7.webp", alt: "Barbershop" },
  { id: "Food", link: "food,coffee-&-tea,restaurants", src: "/bakery.png", alt: "Bookstore" },
  { id: "Local Services", link: "local-services", src: "/new-assets/21.webp", alt: "Boutique" },
  { id: "Pets", link: "pets", src: "/new-assets/6.webp", alt: "Flower Shop" },
  { id: "Professional Services", link: "professional-services", src: "/new-assets/4.webp", alt: "Fruits & Vegetables" },
  { id: "Health & Medical", link: "health-&-medical", src: "/pharmacy.png", alt: "Pharmacy" },
  { id: "Event Planning & Services", link: "event-planning-&-services", src: "/new-assets/Capture123-removebg-preview.png", alt: "Building 1" },
  { id: "Hotels & Casinos", link: "hotels-&-casinos", src: "/Casino__Hotel-removebg-preview.png", alt: "Building 2" },
  { id: "Nightlife", link: "nightlife", src: "/new-assets/1.webp", alt: "Building 3" },
  { id: "Arts & Entertainment", link: "arts-&-entertainment", src: "/new-assets/art-entertairment.png", alt: "Building 4" },
  { id: "Active Life", link: "active-life", src: "/new-assets/8.webp", alt: "Building 5" },
  { id: "General Merchandise Store", link: "general-merchandise-store", src: "/Capture_store-removebg-preview.png", alt: "Building 9" },
  { id: "Online Shopping", link: "online-shopping", src: "/new-assets/online-shopping.png", alt: "Building 6" },
  { id: "Real Estate", link: "real-estate", src: "/Home_Services-removebg-preview.png", alt: "Building 7" },
  { id: "Mass Media", link: "mass-media", src: "/new-assets/21.webp", alt: "Building 8" },
];

// Per-image Y-translate (% of element height) — keeps each illustration
// resting on the ground line. Defaults to 0.
const Y_OFFSET = {
  "/new-assets/10.webp": 15.51,
  "/barber.png": 9.8,
  "/new-assets/5.webp": 8.6,
  "/new-assets/7.webp": 8.43,
  "/bakery.png": 15.68,
  "/new-assets/21.webp": 10.3,
  "/new-assets/6.webp": 16.69,
  "/new-assets/4.webp": 14.17,
  "/pharmacy.png": 7.94,
  "/new-assets/1.webp": 6.91,
  "/new-assets/2.webp": 8.77,
  "/new-assets/art-entertairment.png": 0,
  "/new-assets/8.webp": 15.35,
  "/new-assets/9.webp": 8.94,
  "/new-assets/Shopping_Catergory_Building_for_Carousel__1_-removebg-preview.png": 20.94,
};

// Per-image scale multiplier — defaults to 1.
const SCALE = {
  "/Products___Shopping-removebg-preview.png": 1.24,
  "/Home_Services-removebg-preview.png": 0.82,
  "/new-assets/online-shopping.png": 0.82,
};

const SUN_OR_MOON = ["/sun.webp", "/moon.webp"];
const SKY = ["/day-background.webp", "/night-bg.webp"];

const BUILDING_BASE_W = 180; // px (matches md:w-[170px] / lg:w-[200px] mobile)
const BUILDING_GAP = 40;

const isNight = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20 ? 0 : 1; // index into SUN_OR_MOON / SKY
};

export default function CategoryStreet() {
  const router = useRouter();
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const airplaneRef = useRef(null);

  // Scroll state — driven imperatively for buttery drag feel; React state only
  // exists to trigger re-renders on the framer-motion `x` style.
  const airplaneX = useRef(100); // vw
  const isDragging = useRef(false);
  const dragStartClientX = useRef(0);
  const trackOffset = useRef(0);
  const trackOffsetAtDragStart = useRef(0);
  const velocity = useRef(0);
  const lastFrameTime = useRef(0);
  const lastFrameX = useRef(0);
  const animationFrame = useRef(null);
  const isAnimating = useRef(false);

  const [, forceRender] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollDir, setScrollDir] = useState("right"); // affects car/airplane flip
  const [timeIndex, setTimeIndex] = useState(isNight());

  const buildings = useMemo(() => BUILDINGS, []);
  const maxOffset = useMemo(() => {
    const total = BUILDINGS.length * (BUILDING_BASE_W + BUILDING_GAP + 45);
    return Math.max(
      0,
      total - (typeof window !== "undefined" ? window.innerWidth : 1920),
    );
  }, []);
  const trackWidth = useMemo(
    () => BUILDINGS.length * (BUILDING_BASE_W + BUILDING_GAP),
    [],
  );

  // Re-evaluate day/night every minute.
  useLayoutEffect(() => {
    const id = setInterval(() => setTimeIndex(isNight()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Airplane drift loop — reverses direction whenever the user scrolls.
  useEffect(() => {
    let frame;
    const tick = () => {
      if (scrollDir === "right") {
        airplaneX.current -= 0.2;
        if (airplaneX.current < -30) airplaneX.current = 100;
      } else {
        airplaneX.current += 0.2;
        if (airplaneX.current > 120) airplaneX.current = -20;
      }
      if (airplaneRef.current) {
        airplaneRef.current.style.transform = `translateX(${airplaneX.current}vw) scaleX(${
          scrollDir === "left" ? -1 : 1
        })`;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [scrollDir]);

  useEffect(
    () => () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    },
    [],
  );

  // Inertia / momentum after a drag release.
  const decayMomentum = () => {
    if (Math.abs(velocity.current) > 0.5) {
      velocity.current *= 0.95;
      trackOffset.current = Math.max(
        -maxOffset,
        Math.min(0, trackOffset.current + velocity.current),
      );
      setScrollX(trackOffset.current);
      animationFrame.current = requestAnimationFrame(decayMomentum);
    } else {
      velocity.current = 0;
    }
  };

  // Animated scroll-to (used by arrow buttons).
  const animateTo = (target) => {
    const start = trackOffset.current;
    const delta = target - start;
    const duration = 500;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      trackOffset.current = start + delta * eased;
      setScrollX(trackOffset.current);
      if (t < 1) {
        animationFrame.current = requestAnimationFrame(step);
      } else {
        isAnimating.current = false;
      }
    };
    isAnimating.current = true;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    step();
  };

  // Drag handlers (mouse + touch share the same core).
  const onPointerDown = (clientX) => {
    if (isAnimating.current) return;
    isDragging.current = true;
    dragStartClientX.current = clientX;
    trackOffsetAtDragStart.current = trackOffset.current;
    lastFrameTime.current = Date.now();
    lastFrameX.current = clientX;
    velocity.current = 0;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  };
  const onPointerMove = (clientX) => {
    if (!isDragging.current) return;
    const delta = clientX - dragStartClientX.current;
    const now = Date.now();
    const dt = now - lastFrameTime.current;
    if (dt > 0) {
      velocity.current = ((clientX - lastFrameX.current) / dt) * 16;
    }
    lastFrameTime.current = now;
    lastFrameX.current = clientX;
    const next = Math.max(
      -maxOffset,
      Math.min(0, trackOffsetAtDragStart.current + delta),
    );
    trackOffset.current = next;
    setScrollX(next);
    if (delta > 0) setScrollDir("left");
    else if (delta < 0) setScrollDir("right");
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(velocity.current) > 0.5) decayMomentum();
  };

  const onArrow = (direction) => {
    if (isAnimating.current) return;
    const delta = direction === "right" ? -300 : 300;
    const target = Math.max(
      -maxOffset,
      Math.min(0, trackOffset.current + delta),
    );
    setScrollDir(direction);
    animateTo(target);
  };

  return (
    <div className="w-full h-[55vh] relative overflow-hidden">
      {/* Sky background */}
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${SKY[timeIndex]}')` }}
      />

      {/* Sun / moon (top-right) */}
      <div className="absolute right-3 top-3 z-20 pointer-events-none w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]">
        <img
          src={SUN_OR_MOON[timeIndex]}
          alt={timeIndex === 0 ? "Sun" : "Moon"}
          className="object-contain"
        />
      </div>

      {/* Daytime clouds (top-left) */}
      {timeIndex === 0 && (
        <div className="absolute left-3 top-3 z-20 pointer-events-none w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]">
          <img src="/cloud.webp" alt="Clouds" className="object-contain" />
        </div>
      )}

      {/* Drag/scroll surface */}
      <div
        ref={containerRef}
        className="absolute inset-0 h-[55vh] w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          e.preventDefault();
          onPointerDown(e.clientX);
        }}
        onMouseMove={(e) => onPointerMove(e.clientX)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
        onTouchEnd={onPointerUp}
      >
        {/* Buildings track */}
        <motion.div
          ref={trackRef}
          className="absolute top-0 left-0 z-20 bottom-0 flex items-end gap-[35px] sm:gap-[45px] px-4 h-[65%]"
          style={{
            x: scrollX,
            width: BUILDINGS.length > 0 ? `${trackWidth}px` : "auto",
          }}
        >
          {buildings.map((b) => {
            const offsetY = Y_OFFSET[b.src] ?? 0;
            const scale = SCALE[b.src] ?? 1;
            return (
              <div key={b.id} className="flex-shrink-0">
                <Link href={`/category/${b.link}`}>
                  <div className="relative overflow-hidden group w-[180px] h-[180px] md:w-[170px] md:h-[170px] lg:w-[200px] lg:h-[200px] transition-all duration-300">
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[84%] flex items-end justify-center overflow-hidden">
                      <div className="h-full w-full flex items-end justify-center origin-bottom transition-transform duration-300 group-hover:scale-105">
                        <div
                          className="h-full flex items-end justify-center origin-bottom"
                          style={{ transform: `scale(${scale})` }}
                        >
                          <img
                            src={b.src}
                            alt={b.alt}
                            style={{ transform: `translateY(${offsetY}%)` }}
                            className="h-full w-auto max-w-full object-contain object-bottom"
                            draggable={false}
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      style={{ color: timeIndex ? "white" : "black" }}
                      className="absolute top-7 text-nowrap left-1/2 -translate-x-1/2 text-sm md:text-base font-semibold tracking-wide text-center px-3"
                    >
                      {b.id}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </motion.div>

        {/* Road — repeated tile, flipped vertically */}
        <div className="absolute bottom-0 left-0 w-full h-[45%] z-10">
          <motion.div className="flex h-full" style={{ x: scrollX }}>
            {Array.from({ length: 120 }).map((_, i) => (
              <img
                key={`road-${i}`}
                src="/image.png"
                alt="Road"
                className="w-full h-full transform scale-y-[-1]"
                draggable={false}
              />
            ))}
          </motion.div>
        </div>

        {/* Car — clickable, flips with scroll direction */}
        <motion.div
          onClick={() => router.push("/category/auto-services")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/category/auto-services");
            }
          }}
          role="link"
          tabIndex={0}
          className="absolute left-[8%] bottom-[12%] flex flex-col items-center md:bottom-[10%] lg:bottom-[4%] w-[190px] md:w-[130px] z-10 lg:w-[160px] cursor-pointer"
          style={{
            transform: scrollDir === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <p
            className="font-bold text-white"
            style={{
              transform: scrollDir === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            Automotive
          </p>
          <img
            src="/car.png"
            alt="Car - go to Auto Services"
            width={100}
            height={75}
            className="h-auto w-full drop-shadow-lg z-10"
            draggable={false}
          />
        </motion.div>

        {/* Airplane — drifts across the top */}
        <div
          ref={airplaneRef}
          onClick={() => router.push("/category/airline")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/category/airline");
            }
          }}
          role="link"
          tabIndex={0}
          className="absolute top-[12%] md:top-[5%] left-0 z-10 w-[90px] sm:w-[110px] md:w-[130px] lg:w-[160px] cursor-pointer flex flex-col items-center"
        >
          <p
            className="font-bold text-white"
            style={{
              transform: scrollDir === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            Airline
          </p>
          <img
            src="/airplane.png"
            alt="Airplane"
            width={150}
            height={75}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        {/* Arrow buttons */}
        <div className="absolute bottom-3 left-0 w-full flex justify-between px-4 z-30">
          <button
            type="button"
            className="z-20 p-3 bg-background border rounded-full shadow hover:bg-muted transition-colors opacity-50"
            onClick={() => onArrow("left")}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
          <button
            type="button"
            className="z-20 p-3 bg-background border rounded-full shadow hover:bg-muted transition-colors opacity-50"
            onClick={() => onArrow("right")}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Scroll right"
          >
            <ChevronRight size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
