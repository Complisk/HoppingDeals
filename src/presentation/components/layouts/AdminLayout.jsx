"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/presentation/hooks/use-redux";
import { logout } from "@/presentation/store/authSlice";
import { useAuthService } from "@/presentation/services/authService";
import DynamicSidebar from "@/presentation/components/layouts/DynamicSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { logout: serverLogout } = useAuthService();
  const { adminUser, adminToken, hydrated } = useAppSelector((s) => s.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // The Edge middleware already redirects unauthenticated traffic on
    // protected routes; this is the client-side belt-and-suspenders check
    // that runs once Redux finishes hydrating from localStorage.
    if (hydrated && (!adminToken || !adminUser)) {
      router.replace("/admin/login");
    }
  }, [hydrated, adminToken, adminUser, router]);

  const handleLogout = async () => {
    try {
      await serverLogout();
    } catch {}
    dispatch(logout());
    router.replace("/admin/login");
  };

  if (!adminToken || !adminUser) return null;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside
        className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && <h2 className="text-lg font-bold">Admin</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1">
          <DynamicSidebar onLogout={handleLogout} isCollapsed={sidebarCollapsed} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-4 sm:px-8">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold truncate">{adminUser.fullName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
