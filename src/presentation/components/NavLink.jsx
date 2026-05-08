"use client";
import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/presentation/lib/utils";
const NavLink = forwardRef(({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (<RouterNavLink ref={ref} to={to} className={({ isActive, isPending }) => cn(className, isActive && activeClassName, isPending && pendingClassName)} {...props}/>);
});
NavLink.displayName = "NavLink";
export { NavLink };
