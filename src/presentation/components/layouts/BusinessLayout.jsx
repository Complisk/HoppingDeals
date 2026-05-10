"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Menu,
  X,
  LogOut,
  Megaphone,
  ChevronDown,
  UserCircle,
  Layers,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import Logo from "@/presentation/components/shared/Logo";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/presentation/lib/utils";
import { useAppDispatch, useAppSelector } from "@/presentation/hooks/use-redux";
import { logout } from "@/presentation/store/authSlice";
import { useToast } from "@/presentation/hooks/use-toast";
import { useAuthService } from "@/presentation/services/authService";

const sidebarLinks = [
  { to: "/business/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/business/promotions", icon: Megaphone, label: "My Active Promotions" },
  { to: "/business/promotion-templates", icon: Layers, label: "Saved Templates" },
  { to: "/business/subscription", icon: CreditCard, label: "Subscription" },
];

export default function BusinessLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { logout: serverLogout } = useAuthService();
  const { business } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await serverLogout();
    } catch {}
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.replace("/business/login");
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 px-4 flex items-center border-b border-sidebar-border flex-shrink-0">
          <Logo size="xl" />
        </div>

        <div className="p-4 flex-shrink-0">
          <Button asChild variant="hero" className="w-full">
            <Link href="/business/create-promotion">
              <Plus className="h-5 w-5 mr-2" />
              Create Promotion
            </Link>
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const active =
              pathname === link.to || pathname?.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground mt-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 justify-between z-30 h-16 bg-card border-b border-border flex items-center px-4 lg:px-8 flex-shrink-0">
          <button
            className="lg:hidden p-2 mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
          <div className="sm:hidden md:flex" />

          {business && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Open business profile menu"
                >
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {business.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start min-w-0 leading-tight">
                    <span className="text-sm font-semibold text-foreground truncate max-w-45">
                      {business.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-45">
                      {business.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-50 rounded-xl border border-border bg-card p-1 shadow-lg"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/business/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
