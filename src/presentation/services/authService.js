"use client";

// Centralized auth service. JWT lives in an httpOnly cookie now, so we don't
// shuffle tokens through localStorage anymore — the cookie rides on every
// /api request automatically (see lib/apiAction.js).

import { useApi } from "@/presentation/hooks/useApi";
import { toast } from "react-toastify";
import {
  setUserLoading,
  setUserSuccess,
  setUserError,
  setBusinessLoading,
  setBusinessSuccess,
  setBusinessError,
  setAdminSuccess,
} from "@/presentation/store/authSlice";

export const useAuthService = () => {
  const { call } = useApi();

  const registerUser = async (dispatch, data) => {
    dispatch(setUserLoading());
    const { response, error } = await call("/auth/register", {
      method: "POST",
      data,
    });
    if (error) {
      const msg = error.message || "Registration failed. Please try again.";
      dispatch(setUserError(msg));
      throw new Error(msg);
    }
    if (response?.token) {
      const userData = {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      };
      dispatch(setUserSuccess({ user: userData, token: response.token }));
      toast.success("Registration successful!");
      return { user: userData, token: response.token };
    }
    return null;
  };

  const loginUser = async (dispatch, payload) => {
    dispatch(setUserLoading());
    const { response, error } = await call("/auth/login", {
      method: "POST",
      data: { ...payload, type: "user" },
    });
    if (error) {
      const msg = error.message || "Invalid credentials.";
      dispatch(setUserError(msg));
      throw new Error(msg);
    }
    if (response?.token) {
      const userData = {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      };
      dispatch(setUserSuccess({ user: userData, token: response.token }));
      toast.success("Login successful!");
      return { user: userData, token: response.token };
    }
    return null;
  };

  const registerBusiness = async (dispatch, data) => {
    dispatch(setBusinessLoading());
    const { response, error } = await call("/auth/register/business", {
      method: "POST",
      data,
    });
    if (error) {
      const msg = error.message || "Registration failed. Please try again.";
      dispatch(setBusinessError(msg));
      throw new Error(msg);
    }
    if (response?.token) {
      dispatch(
        setBusinessSuccess({ business: response, token: response.token }),
      );
      toast.success("Business registration successful!");
      return { business: response, token: response.token };
    }
    return null;
  };

  const loginBusiness = async (dispatch, payload) => {
    dispatch(setBusinessLoading());
    const { response, error } = await call("/auth/login", {
      method: "POST",
      data: { ...payload, type: "business" },
    });
    if (error) {
      const msg = error.message || "Invalid credentials.";
      dispatch(setBusinessError(msg));
      throw new Error(msg);
    }
    if (response?.token) {
      dispatch(
        setBusinessSuccess({ business: response, token: response.token }),
      );
      toast.success("Welcome back!");
      return { business: response, token: response.token };
    }
    return null;
  };

  const loginAdmin = async (dispatch, payload) => {
    dispatch(setUserLoading());
    const { response, error } = await call("/auth/login", {
      method: "POST",
      data: { ...payload, type: "admin" },
    });
    if (error) {
      const msg = error.message || "Login failed";
      dispatch(setUserError(msg));
      throw new Error(msg);
    }
    const isAdmin =
      response?.token &&
      (response.isSuperAdmin === true || response.role?.name);
    if (!isAdmin) {
      const msg = "You do not have admin access";
      dispatch(setUserError(msg));
      throw new Error(msg);
    }
    dispatch(setAdminSuccess({ adminUser: response, token: response.token }));
    toast.success("Admin login successful!");
    return response;
  };

  const logout = async () => {
    await call("/auth/logout", { method: "POST" });
    toast.success("Logged out successfully!");
  };

  return {
    registerUser,
    loginUser,
    registerBusiness,
    loginBusiness,
    loginAdmin,
    logout,
  };
};

export default useAuthService;
