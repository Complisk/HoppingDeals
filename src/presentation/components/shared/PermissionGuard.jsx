"use client";

import { usePermissions } from "@/presentation/hooks/usePermissions";
/**
 * Component to conditionally render content based on user permissions
 * Usage:
 * <PermissionGuard module="businesses" action="view">
 *   <BusinessList />
 * </PermissionGuard>
 */
export const PermissionGuard = ({ module, action, children, fallback, silent = true, }) => {
    const { hasPermission, isLoading } = usePermissions();
    // Show loading state if permissions are still loading
    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-10 rounded"/>;
    }
    // Check if user has permission
    const allowed = hasPermission(module, action);
    if (allowed) {
        return <>{children}</>;
    }
    // If not allowed
    if (silent) {
        return null;
    }
    if (fallback) {
        return <>{fallback}</>;
    }
    return (<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        You don't have permission to {action} {module}
      </p>
    </div>);
};
/**
 * Component for checking multiple permissions
 * Usage:
 * <MultiPermissionGuard
 *   permissions={[
 *     { module: "businesses", action: "view" },
 *     { module: "businesses", action: "edit" }
 *   ]}
 *   mode="any"
 * >
 *   <BusinessActions />
 * </MultiPermissionGuard>
 */
export const MultiPermissionGuard = ({ permissions, mode = "any", children, fallback, silent = true, }) => {
    const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-10 rounded"/>;
    }
    const allowed = mode === "all"
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    if (allowed) {
        return <>{children}</>;
    }
    if (silent) {
        return null;
    }
    if (fallback) {
        return <>{fallback}</>;
    }
    return (<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        You don't have permission to perform this action
      </p>
    </div>);
};
/**
 * Button component that disables itself if user doesn't have permission
 * Usage:
 * <PermissionButton module="businesses" action="edit">
 *   Edit Business
 * </PermissionButton>
 */
export const PermissionButton = ({ module, action, children, disabled, title, ...props }) => {
    const { hasPermission, isLoading } = usePermissions();
    const allowed = hasPermission(module, action);
    const isDisabled = disabled || isLoading || !allowed;
    const tooltipText = title ||
        (!allowed ? `You don't have permission to ${action} ${module}` : undefined);
    return (<button disabled={isDisabled} title={tooltipText} className={isDisabled ? "opacity-50 cursor-not-allowed" : ""} {...props}>
      {children}
    </button>);
};
