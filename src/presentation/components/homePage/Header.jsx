"use client";

// Header — mirrors the live complisk.com layout:
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
} from "lucide-react";
import { logout as userLogout } from "@/presentation/store/authSlice";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";
import { cn } from "@/presentation/lib/utils";

const PRIMARY = "#E31E24";

const PUBLIC_ITEMS = [
  { label: "About Us", href: "/about-us", Icon: Info },
  { label: "Blog", href: "/blog", Icon: BookOpen },
  { label: "Photo Gallery", href: "/photos", Icon: ImageIcon },
  { label: "Categories", href: "/categories", Icon: Grid },
  {
    label: "Complisk Business Directory",
    href: "/complisk-business-directory",
    Icon: Building2,
  },
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
      <header className="py-3 px-4 z-40 sm:px-8 border-b border-gray-100 fixed top-0 left-0 right-0 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/business/visitor" className="hidden sm:inline-flex">
              <button
                type="button"
                className="border border-[color:var(--primary,#E31E24)] text-[#E31E24] font-semibold text-base px-4 py-2 rounded-md hover:bg-red-50 transition"
              >
                Business Portal
              </button>
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="p-2 rounded-xl border-gray-200 hover:bg-gray-100 transition"
                >
                  <Menu className="h-7 w-7 text-gray-500" />
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
                    {/* Mobile-only Business Portal entry, since the desktop button is hidden on small screens */}
                    <div className="sm:hidden">
                      <MenuItem
                        href="/business/visitor"
                        Icon={Building2}
                        label="Business Portal"
                        active={pathname?.startsWith("/business/visitor")}
                      />
                      <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                    </div>

                    {PUBLIC_ITEMS.map((item) => (
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
