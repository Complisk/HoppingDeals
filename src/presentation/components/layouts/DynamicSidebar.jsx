"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Building2,
  Gift,
  Lock,
  LogOut,
} from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { Button } from "@/presentation/components/ui/button";

const ALL_MENU_ITEMS = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    requiredPermission: { module: "dashboard", action: "view" },
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    requiredPermission: { module: "users", action: "view" },
  },
  {
    title: "Businesses",
    path: "/admin/businesses",
    icon: <Building2 className="h-4 w-4" />,
    requiredPermission: { module: "businesses", action: "view" },
  },
  {
    title: "Promotions",
    path: "/admin/promotions",
    icon: <Gift className="h-4 w-4" />,
    requiredPermission: { module: "promotions", action: "view" },
  },
  {
    title: "Templates",
    path: "/admin/templates",
    icon: <Gift className="h-4 w-4" />,
    requiredPermission: { module: "templates", action: "view" },
  },
  {
    title: "Roles & Permissions",
    path: "/admin/roles",
    icon: <Lock className="h-4 w-4" />,
    requiredPermission: { module: "roles", action: "view" },
  },
];

export const DynamicSidebar = ({ onLogout, isCollapsed = false }) => {
  const pathname = usePathname();
  const adminUser = useSelector((s) => s.auth.adminUser);

  // Read once on mount; localStorage is browser-only.
  const [adminPermissions, setAdminPermissions] = useState({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem("adminPermissions");
      setAdminPermissions(stored ? JSON.parse(stored) : {});
    } catch {
      setAdminPermissions({});
    }
  }, []);

  const visibleMenuItems = useMemo(() => {
    if (adminUser?.isSuperAdmin) return ALL_MENU_ITEMS;
    return ALL_MENU_ITEMS.filter((item) => {
      if (!item.requiredPermission) return true;
      const { module, action } = item.requiredPermission;
      const perms = adminPermissions[module] || [];
      return perms.includes(action);
    });
  }, [adminUser?.isSuperAdmin, adminPermissions]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-4">
        <div className="space-y-5">
          {visibleMenuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                title={item.title}
              >
                {item.icon}
              </div>
            </Link>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-10 p-0"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6 p-2">
        {visibleMenuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground",
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          </Link>
        ))}
      </div>
      <div className="p-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DynamicSidebar;
