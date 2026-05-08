"use client";

// SSR-safe Redux slice: do not touch `localStorage` at module init (the store
// is built on the server during prerender — `localStorage` doesn't exist).
// Hydrate from storage in a client-only effect via `hydrateFromStorage`.

import { createSlice } from "@reduxjs/toolkit";

const isBrowser = typeof window !== "undefined";

const safeGet = (key) => {
  if (!isBrowser) return null;
  try { return localStorage.getItem(key); } catch { return null; }
};

const parseStorageItem = (key) => {
  if (!isBrowser) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    if (isBrowser) {
      try { localStorage.removeItem(key); } catch {}
    }
    return null;
  }
};

const safeSet = (key, value) => {
  if (!isBrowser) return;
  try { localStorage.setItem(key, value); } catch {}
};
const safeRemove = (key) => {
  if (!isBrowser) return;
  try { localStorage.removeItem(key); } catch {}
};

// Server-rendered state must be deterministic — empty.
const initialState = {
  userToken: null,
  businessToken: null,
  user: null,
  business: null,
  adminToken: null,
  adminUser: null,
  isLoading: false,
  error: null,
  accountType: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Pulled from localStorage on the client after first paint.
    hydrateFromStorage: (state) => {
      state.userToken = safeGet("userToken");
      state.businessToken = safeGet("businessToken");
      state.adminToken = safeGet("adminToken");
      state.user = parseStorageItem("user");
      state.business = parseStorageItem("business");
      state.adminUser = parseStorageItem("adminUser");
      state.accountType = safeGet("accountType");
      state.hydrated = true;
    },

    setUserLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setUserSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.userToken = action.payload.token;
      state.accountType = "user";
      state.error = null;
      safeSet("userToken", action.payload.token);
      safeSet("user", JSON.stringify(action.payload.user));
      safeSet("accountType", "user");
    },
    setUserError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    setAdminLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setAdminSuccess: (state, action) => {
      state.isLoading = false;
      state.adminUser = action.payload.adminUser;
      state.adminToken = action.payload.token;
      state.error = null;
      const { adminUser, token } = action.payload;
      safeSet("adminToken", token);
      safeSet("adminUser", JSON.stringify(adminUser));
      const permissions = adminUser.isSuperAdmin
        ? "ALL"
        : adminUser.role?.permissions || {};
      safeSet("adminPermissions", JSON.stringify(permissions));
    },
    setAdminError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    setBusinessLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setBusinessSuccess: (state, action) => {
      state.isLoading = false;
      state.business = action.payload.business;
      state.businessToken = action.payload.token;
      state.accountType = "business";
      state.error = null;
      safeSet("businessToken", action.payload.token);
      safeSet("business", JSON.stringify(action.payload.business));
      safeSet("accountType", "business");
    },
    setBusinessError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.userToken = null;
      state.businessToken = null;
      state.adminToken = null;
      state.user = null;
      state.business = null;
      state.adminUser = null;
      state.accountType = null;
      state.error = null;
      [
        "userToken",
        "businessToken",
        "adminToken",
        "user",
        "business",
        "adminUser",
        "accountType",
        "adminPermissions",
      ].forEach(safeRemove);
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  hydrateFromStorage,
  setUserLoading,
  setUserSuccess,
  setUserError,
  setBusinessLoading,
  setBusinessSuccess,
  setBusinessError,
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
