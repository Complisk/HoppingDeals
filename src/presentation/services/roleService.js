"use client";

import { useApi } from "@/presentation/hooks/useApi";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/presentation/lib/errorHandler";
/**
 * Role Service - Handles all role-related API calls
 */
export const useRoleService = () => {
  const { call } = useApi();
  // Get all available permissions
  const getAvailablePermissions = async () => {
    try {
      const { response, error } = await call("/roles/permissions", {
        method: "GET",
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get permissions error:", errorMessage);
        return null;
      }
      return response || null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get permissions error:", error);
      return null;
    }
  };
  // Get all roles
  const getRoles = async () => {
    try {
      const { response, error } = await call("/roles", {
        method: "GET",
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get roles error:", errorMessage);
        return null;
      }
      return response || [];
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get roles error:", error);
      return null;
    }
  };
  // Get single role by ID
  const getRole = async (roleId) => {
    try {
      const { response, error } = await call(`/roles/${roleId}`, {
        method: "GET",
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get role error:", errorMessage);
        return null;
      }
      return response || null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get role error:", error);
      return null;
    }
  };
  // Create new role with permissions
  const createRole = async (name, permissions) => {
    try {
      const { response, error } = await call("/roles", {
        method: "POST",
        data: { name, permissions },
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }
      if (response) {
        toast.success("Role created successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Create role error:", error);
      return null;
    }
  };
  // Update role with new permissions
  const updateRole = async (roleId, permissions) => {
    try {
      const { response, error } = await call(`/roles/${roleId}`, {
        method: "PUT",
        data: { permissions },
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }
      if (response) {
        toast.success("Role updated successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Update role error:", error);
      return null;
    }
  };
  // Delete role
  const deleteRole = async (roleId) => {
    try {
      const { response, error } = await call(`/roles/${roleId}`, {
        method: "DELETE",
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return false;
      }
      if (response) {
        toast.success("Role deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Delete role error:", error);
      return false;
    }
  };
  // Create admin user with role
  const createAdminUser = async (
    fullName,
    email,
    password,
    roleId,
    isSuperAdmin,
  ) => {
    try {
      const { response, error } = await call("/admin/create-admin", {
        method: "POST",
        data: { fullName, email, password, roleId, isSuperAdmin },
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }
      if (response) {
        toast.success("Admin user created successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Create admin user error:", error);
      return null;
    }
  };
  // Update admin user role
  const updateAdminRole = async (userId, roleId, isSuperAdmin) => {
    try {
      const { response, error } = await call(`/admin/users/${userId}/role`, {
        method: "PUT",
        data: { roleId, isSuperAdmin },
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }
      if (response) {
        toast.success("User role updated successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Update admin role error:", error);
      return null;
    }
  };
  return {
    getAvailablePermissions,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    createAdminUser,
    updateAdminRole,
  };
};
