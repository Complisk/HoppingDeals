"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Menu,
  X,
  LogOut,
  Megaphone,
} from "lucide-react";
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
  { to: "/business/promotions", icon: Megaphone, label: "My Promotions" },
  { to: "/business/subscription", icon: CreditCard, label: "Subscription" },
];

export default function BusinessLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { logout: serverLogout } = useAuthService();
  const { business } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await serverLogout();
    } catch {}
    dispatch(logout());
    toast({ title: "Logged out", description: "You have been successfully logged out." });
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
        <div className="p-6 border-b border-sidebar-border flex-shrink-0">
          <Logo />
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
            const active = pathname === link.to || pathname?.startsWith(`${link.to}/`);
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
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {business.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {business.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {business.email}
                </p>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
