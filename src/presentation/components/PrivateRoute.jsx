"use client";
import { redirect } from "next/navigation";
import { useAppSelector } from "@/presentation/hooks/use-redux";
/**
 * PrivateRoute Component - Protects routes based on authentication and role
 *
 * Usage:
 * <Route element={<PrivateRoute requiredRole="business" />}>
 *   <Route path="dashboard" element={<BusinessDashboard />} />
 * </Route>
 */
const PrivateRoute = ({ requiredRole }) => {
    const { businessToken, userToken, accountType, business, user, adminToken, adminUser, } = useAppSelector((state) => state.auth);
    // Check Business Routes
    if (requiredRole === "business") {
        // User must have business token and be logged in as business
        if (!businessToken || !business || accountType !== "business") {
            return {redirect("/business/login")};
        }
        return {children};
    }
    // Check Admin Routes
    if (requiredRole === "admin") {
        // User must have admin token and have admin role
        if (!adminToken || !adminUser) {
            return {redirect("/admin/login")};
        }
        return {children};
    }
    // Check User Routes (regular user)
    if (requiredRole === "user") {
        // User must have user token
        if (!userToken || !user) {
            return {redirect("/login")};
        }
        return {children};
    }
    // No specific role required
    return {children};
};
export default PrivateRoute;
