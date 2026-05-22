"use client";

// Header — mirrors the live hoppingdeals.world layout:
//   Top row:    Logo (left) ── Business Portal button + hamburger menu (right)
//   Bottom row: HeaderLocationSearch (left) ── Login link (right, mobile-only)
//
// The hamburger opens a Radix DropdownMenu with the same items as the live
// site, with the current route highlighted in red. Auth state controls
// whether Login/Register or My Profile/Logout appear at the bottom.

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import {
  Menu,
  Info,
  BookOpen,
  Image as ImageIcon,
  Grid,
  Building2,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logout as userLogout } from "@/presentation/store/authSlice";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";
import { cn } from "@/presentation/lib/utils";

const PRIMARY = "#E31E24";

// Top-level menu items that aren't the Categories submenu. Categories
// is rendered inline below because it needs DropdownMenu.Sub semantics.
const PUBLIC_ITEMS_BEFORE_CATEGORIES = [
  { label: "About Us", href: "/about-us", Icon: Info },
  { label: "Blog", href: "/blog", Icon: BookOpen },
  { label: "Photo Gallery", href: "/photos", Icon: ImageIcon },
];
const PUBLIC_ITEMS_AFTER_CATEGORIES = [
  {
    label: "Hopping Deals Business Directory",
    href: "/hopping-deals-business-directory",
    Icon: Building2,
  },
];

// Category list mirrors the live hoppingdeals.world menu. Each entry links to
// /category/<slug> — slugs match the keys our PromotionFeed uses.
const CATEGORIES = [
  { label: "Restaurants", slug: "restaurants" },
  { label: "Beauty & Spas", slug: "beauty-spas" },
  { label: "Home Services", slug: "home-services" },
  { label: "Coffee & Tea", slug: "coffee-tea" },
  { label: "Food", slug: "food" },
  { label: "Auto Services", slug: "auto-services" },
  { label: "Pets", slug: "pets" },
  { label: "Professional Services", slug: "professional-services" },
  { label: "Health & Medical", slug: "health-medical" },
  { label: "Event Planning & Services", slug: "event-planning-services" },
  { label: "Hotels & Casinos", slug: "hotels-casinos" },
  { label: "Nightlife", slug: "nightlife" },
  { label: "Active Life", slug: "active-life" },
  { label: "Education", slug: "education" },
  { label: "Arts & Entertainment", slug: "arts-entertainment" },
  { label: "Travel & Activities", slug: "travel-activities" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const business = useSelector((s) => s.auth.business);
  const isAuthed = Boolean(user || business);

  const handleLogout = () => {
    dispatch(userLogout());
    router.push("/auth/login");
  };

  return (
    <>
      <header className="py-3 px-3 z-40 sm:px-8 border-b border-gray-100 fixed top-0 left-0 right-0 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="shrink-0">
            <span className="sm:hidden">
              <Logo size="md" />
            </span>
            <span className="hidden sm:inline">
              <Logo size="xl" />
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/business/visitor" className="inline-flex">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap  rounded-sm border border-[#000000] bg-white px-5 text-sm font-semibold leading-none text-[#E31E24] transition hover:bg-red-50 sm:h-10 sm:px-6 sm:text-base"
              >
                Business Portal
              </button>
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 sm:h-10 sm:w-10"
                >
                  <Menu className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200 z-50 p-2"
                  >
                    {PUBLIC_ITEMS_BEFORE_CATEGORIES.map((item) => (
                      <MenuItem
                        key={item.href}
                        href={item.href}
                        Icon={item.Icon}
                        label={item.label}
                        active={
                          pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`)
                        }
                      />
                    ))}

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition outline-none data-[state=open]:bg-red-50 data-[state=open]:text-[#E31E24]",
                          pathname?.startsWith("/category/") ||
                            pathname === "/categories"
                            ? "bg-red-50 text-[#E31E24]"
                            : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
                        )}
                      >
                        <span className="text-[#E31E24]">
                          <Grid className="h-5 w-5" />
                        </span>
                        <span className="flex-1">Categories</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </DropdownMenu.SubTrigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent
                          sideOffset={8}
                          alignOffset={-4}
                          className="w-64 max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200 z-50 p-2"
                        >
                          {CATEGORIES.map((cat) => {
                            const href = `/category/${cat.slug}`;
                            const active = pathname === href;
                            return (
                              <DropdownMenu.Item asChild key={cat.slug}>
                                <Link
                                  href={href}
                                  className={cn(
                                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition outline-none cursor-pointer",
                                    active
                                      ? "bg-red-50 text-[#E31E24]"
                                      : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
                                  )}
                                >
                                  {cat.label}
                                </Link>
                              </DropdownMenu.Item>
                            );
                          })}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    {PUBLIC_ITEMS_AFTER_CATEGORIES.map((item) => (
                      <MenuItem
                        key={item.href}
                        href={item.href}
                        Icon={item.Icon}
                        label={item.label}
                        active={
                          pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`)
                        }
                      />
                    ))}

                    {!isAuthed && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <MenuItem
                          href="/auth/login"
                          Icon={LogIn}
                          label="Login"
                          active={
                            pathname === "/auth/login" || pathname === "/login"
                          }
                        />
                        <MenuItem
                          href="/auth/register"
                          Icon={UserPlus}
                          label="Register"
                          active={pathname === "/auth/register"}
                        />
                      </>
                    )}

                    {isAuthed && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <div className="px-4 py-2 text-gray-500 text-xs uppercase tracking-wide">
                          {user?.fullName || business?.name}
                        </div>
                        {business && (
                          <MenuItem
                            href="/business/dashboard"
                            Icon={LayoutDashboard}
                            label="Business Dashboard"
                            active={pathname?.startsWith("/business/dashboard")}
                          />
                        )}
                        {user && (
                          <MenuItem
                            href="/profile"
                            Icon={User}
                            label="My Profile"
                            active={pathname === "/profile"}
                          />
                        )}
                        <DropdownMenu.Item
                          onSelect={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-gray-700 text-sm font-medium hover:bg-red-50 hover:text-[#E31E24] focus:outline-none transition"
                        >
                          <span style={{ color: PRIMARY }}>
                            <LogOut size={18} />
                          </span>
                          Logout
                        </DropdownMenu.Item>
                      </>
                    )}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 flex justify-between items-center text-sm gap-4">
          <HeaderLocationSearch />

          <div className="flex items-center gap-4">
            {user?.fullName || business?.name ? (
              <span className="hidden sm:inline text-gray-700 font-medium whitespace-nowrap">
                Welcome • {user?.fullName || business?.name}
              </span>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-[#E31E24] transition font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Spacer matching the fixed header height */}
      <div className="h-28" aria-hidden="true" />
    </>
  );
}

function MenuItem({ href, Icon, label, active = false }) {
  // Wrapping a Radix DropdownMenu.Item in next/link gives us both keyboard/menu
  // semantics and client-side navigation. asChild forwards Radix's a11y props.
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition outline-none",
          active
            ? "bg-red-50 text-[#E31E24]"
            : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
        )}
      >
        <span className="text-[#E31E24]">
          <Icon className="h-5 w-5" />
        </span>
        {label}
      </Link>
    </DropdownMenu.Item>
  );
}
