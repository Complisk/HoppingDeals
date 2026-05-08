import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import promotionReducer from "./promotionSlice";
import adminReducer from "./adminSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    promotion: promotionReducer,
    admin: adminReducer,
  },
});
