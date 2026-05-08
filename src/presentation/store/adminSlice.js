"use client";

import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  loading: false,
  success: null,
  error: null,
  dashboardData: null,
  usersList: null,
  businessesList: null,
  promotionsList: null,
};
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminLoading: (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    },
    setAdminSuccess: (state, action) => {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    setAdminError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = null;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
    setUsersList: (state, action) => {
      state.usersList = action.payload;
    },
    setBusinessesList: (state, action) => {
      state.businessesList = action.payload;
    },
    setPromotionsList: (state, action) => {
      state.promotionsList = action.payload;
    },
    clearAdmin: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
      state.dashboardData = null;
      state.usersList = null;
      state.businessesList = null;
      state.promotionsList = null;
    },
  },
});
export const {
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  setDashboardData,
  setUsersList,
  setBusinessesList,
  setPromotionsList,
  clearAdmin,
} = adminSlice.actions;
export default adminSlice.reducer;
