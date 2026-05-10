"use client";

// BusinessHeader — used on /business/visitor (and similar marketing pages).
// Mirrors the live complisk.com layout: a simple two-end header with the
// logo on the left and a Login or Business Dashboard button + hamburger
// menu on the right. When logged in, the business name appears as a
// subtle line under the logo (rather than competing for centre space).

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Info,
  Building2,
  LogIn,
  UserPlus,
  User,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/presentation/store/authSlice";
import Logo from "./Logo";

export default function BusinessHeader() {
  const dispatch = useDispatch();
  const router = useRouter();
  const business = useSelector((state) => state.auth.business);
  const isBusinessLoggedIn = useSelector(
    (state) => state.auth.businessToken !== null,
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push("/business/login");
  };

  return (
    <header className="z-50 border-b border-gray-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size ="xl"/>
          {isBusinessLoggedIn && business ? (
            <Link
              href="/business/profile"
              className="hidden truncate text-sm font-medium text-gray-700 hover:underline sm:block"
              title={business.name}
            >
              {business.name}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {!isBusinessLoggedIn ? (
            <Link href="/business/login">
              <button
                type="button"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] transition hover:bg-red-100 sm:px-3 sm:text-sm md:text-base"
              >
                Login
              </button>
            </Link>
          ) : (
            <Link href="/business/dashboard">
              <button
                type="button"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] transition hover:bg-red-100 sm:px-3 sm:text-sm md:text-base"
              >
                Business Dashboard
              </button>
            </Link>
          )}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100 sm:p-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={10} asChild>
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="z-50 w-56 rounded-2xl border border-gray-200 bg-white/90 p-2 shadow-xl backdrop-blur-xl"
                >
                  <MenuItem icon={<Info />} label="About Us" to="/about-us" />
                  <MenuItem
                    icon={<Building2 />}
                    label="Complisk Business Directory"
                    to="/complisk-business-directory"
                  />

                  {!isBusinessLoggedIn && (
                    <>
                      <MenuItem
                        icon={<LogIn />}
                        label="Login"
                        to="/business/login"
                      />
                      <MenuItem
                        icon={<UserPlus />}
                        label="Register"
                        to="/business/register"
                      />
                    </>
                  )}

                  {isBusinessLoggedIn && (
                    <>
                      <MenuItem
                        icon={<User />}
                        label="My Profile"
                        to="/business/profile"
                      />
                      <MenuItem
                        icon={<LogOut />}
                        label="Logout"
                        onClick={handleLogout}
                      />
                    </>
                  )}
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, to, onClick }) {
  const inner = (
    <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24] focus:outline-none">
      <span className="text-[#E31E24]">{icon}</span>
      {label}
    </div>
  );

  if (onClick) {
    return (
      <DropdownMenu.Item asChild>
        <button type="button" onClick={onClick} className="w-full text-left">
          {inner}
        </button>
      </DropdownMenu.Item>
    );
  }
  if (to) {
    return (
      <DropdownMenu.Item asChild>
        <Link href={to}>{inner}</Link>
      </DropdownMenu.Item>
    );
  }
  return inner;
}
