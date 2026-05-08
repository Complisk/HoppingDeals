"use client";

import { useApi } from "@/presentation/hooks/useApi";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/presentation/lib/errorHandler";
import {
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  setDashboardData,
} from "@/presentation/store/adminSlice";
/**
 * Admin Service - Centralized admin API layer
 * Uses the unified useApi hook for all admin API calls
 * Handles Redux dispatch internally for admin state management
 */
export const useAdminService = () => {
  const { call } = useApi();
  // Get admin dashboard statistics
  const getDashboardStats = async (dispatch) => {
    try {
      dispatch(setAdminLoading());
      const { response, error } = await call("/admin/dashboard", {
        method: "GET",
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(setAdminError(errorMessage));
        throw new Error(errorMessage);
      }
      if (response) {
        dispatch(setDashboardData(response));
        dispatch(setAdminSuccess("Dashboard data fetched"));
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get dashboard stats error:", error);
      dispatch(setAdminError(errorMessage));
      throw new Error(errorMessage);
    }
  };
  // Get all users with pagination and filters
  const getUsers = async (page = 1, limit = 10, search, role, status) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search?.trim()) params.append("search", search);
      if (role?.trim()) params.append("role", role);
      if (status?.trim()) params.append("status", status);
      const { response } = await call(`/admin/users?${params.toString()}`, {
        method: "GET",
      });
      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  };
  // Update user status
  const updateUserStatus = async (userId, newStatus) => {
    try {
      const { response, error } = await call(`/admin/users/${userId}/status`, {
        method: "PUT",
        data: { status: newStatus },
      });
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (response) {
        const successMessage = response?.message || "User status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update user status error:", error);
      throw new Error(errorMessage);
    }
  };
  // Get all businesses with pagination and filters
  const getBusinesses = async (
    page = 1,
    limit = 10,
    search,
    status,
    autoApprove,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search?.trim()) params.append("search", search);
      if (status?.trim()) params.append("status", status);
      if (autoApprove !== undefined)
        params.append("autoApprove", autoApprove.toString());
      const { response } = await call(
        `/admin/businesses?${params.toString()}`,
        {
          method: "GET",
        },
      );
      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get businesses error:", error);
      throw error;
    }
  };
  // Update business status
  const updateBusinessStatus = async (businessId, newStatus) => {
    try {
      const { response, error } = await call(
        `/admin/businesses/${businessId}/status`,
        {
          method: "PUT",
          data: { status: newStatus },
        },
      );
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (response) {
        const successMessage = response?.message || "Business status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update business status error:", error);
      throw new Error(errorMessage);
    }
  };
  // Toggle business auto-approve setting
  const toggleBusinessAutoApprove = async (businessId, autoApprove) => {
    try {
      const { response, error } = await call(
        `/admin/businesses/${businessId}/toggle-auto-approve`,
        {
          method: "PUT",
          data: { autoApprovePromotions: autoApprove },
        },
      );
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (response) {
        const successMessage =
          response?.message || "Business auto-approve setting updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Toggle auto-approve error:", error);
      throw new Error(errorMessage);
    }
  };
  // Get all promotions with pagination and filters
  const getPromotions = async (page = 1, limit = 10, status, search) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status?.trim()) params.append("status", status);
      if (search?.trim()) params.append("search", search);
      const { response } = await call(
        `/admin/promotions?${params.toString()}`,
        {
          method: "GET",
        },
      );
      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get promotions error:", error);
      throw error;
    }
  };
  // Update promotion status (approve, reject, deactivate)
  const updatePromotionStatus = async (promotionId, newStatus) => {
    try {
      const { response, error } = await call(
        `/admin/promotions/${promotionId}/status`,
        {
          method: "PUT",
          data: { status: newStatus },
        },
      );
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (response) {
        const successMessage = response?.message || "Promotion status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update promotion status error:", error);
      throw new Error(errorMessage);
    }
  };
  // Delete promotion
  const deletePromotion = async (promotionId) => {
    try {
      const { response, error } = await call(
        `/admin/promotions/${promotionId}`,
        {
          method: "DELETE",
        },
      );
      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      if (response) {
        const successMessage =
          response?.message || "Promotion deleted successfully";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Delete promotion error:", error);
      throw new Error(errorMessage);
    }
  };
  return {
    getDashboardStats,
    getUsers,
    updateUserStatus,
    getBusinesses,
    updateBusinessStatus,
    toggleBusinessAutoApprove,
    getPromotions,
    updatePromotionStatus,
    deletePromotion,
  };
};
/**
 * Direct admin service functions (not using hooks)
 * These are used for role management and other admin operations
 */
const adminService = {
  // Get all admin users
  getAllAdminUsers: async (page = 1, limit = 10, search = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      const response = await fetch(`/admin/roles/admins?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch admin users");
      }
      const data = await response.json();
      return data.admins;
    } catch (error) {
      console.error("Get admin users error:", error);
      throw error;
    }
  },
  // Create new admin user
  createAdminUser: async (adminData) => {
    try {
      const response = await fetch(`/admin/roles/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify(adminData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create admin user");
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Create admin user error:", error);
      throw error;
    }
  },
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await fetch(`/admin/roles/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch roles");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    }
  },
  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await fetch(`/admin/roles/permissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch permissions");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get permissions error:", error);
      throw error;
    }
  },
  // Update user roles
  updateUserRoles: async (userId, roleIds) => {
    try {
      const response = await fetch(`/admin/roles/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ roleIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user roles");
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Update user roles error:", error);
      throw error;
    }
  },
  // Get user permissions
  getUserPermissions: async (userId) => {
    try {
      const response = await fetch(`/admin/roles/user/${userId}/permissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user permissions");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get user permissions error:", error);
      throw error;
    }
  },
  // Initialize roles and permissions (run once)
  initializeRolesAndPermissions: async () => {
    try {
      const response = await fetch(`/admin/roles/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initialize roles");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Initialize roles error:", error);
      throw error;
    }
  },
  // Create a new role
  createRole: async (roleData) => {
    try {
      const response = await fetch(`/admin/roles/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  },
  // Get a single role
  getRoleById: async (roleId) => {
    try {
      const response = await fetch(`/admin/roles/roles/${roleId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch role");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get role error:", error);
      throw error;
    }
  },
  // Update a role
  updateRole: async (roleId, roleData) => {
    try {
      const response = await fetch(`/admin/roles/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  },
  // Delete a role
  deleteRole: async (roleId) => {
    try {
      const response = await fetch(`/admin/roles/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  },
  // Assign roles to user
  assignRolesToUser: async (userId, roleIds) => {
    try {
      const response = await fetch(`/admin/roles/user/${userId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ roleIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign roles");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Assign roles error:", error);
      throw error;
    }
  },
};
export default adminService;
