"use client";

// Centralized API client. Migrated from the old Vite-based one:
//   - base URL is now a relative "/api" (same-origin in Next), so cookie auth
//     just works without CORS configuration
//   - JWT lives in an httpOnly cookie, so we don't need Authorization headers
//     and don't read tokens from localStorage anymore

import axios from "axios";
import { toast } from "react-toastify";

const baseUrl = "/api";

const fetchData = async (
  url,
  options = {},
  callBack,
  _notProtected,
  suppressErrorToast = false,
) => {
  let response = null;
  let error = null;

  try {
    const config = {
      url: baseUrl + url,
      ...options,
      withCredentials: true, // include httpOnly session cookie
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    };

    const res = await axios(config);
    response = res.data;
    if (callBack) callBack(response, true);
  } catch (err) {
    const responseData = err.response?.data;
    const status = err.response?.status;
    const responseMessage = responseData?.message;

    error = responseData || { message: err.message };
    if (callBack) callBack(responseData, false);

    // Silently swallow expected "No token provided" 401s — these fire when a
    // visitor hits an authenticated endpoint and should not surface a toast.
    if (status === 401 && responseMessage === "No token provided") {
      return { response, error };
    }

    if (status === 403) {
      const message =
        responseMessage || "You don't have permission to perform this action";
      if (!suppressErrorToast) toast.error(message);
      return { response, error };
    }

    if (responseMessage && !suppressErrorToast) {
      toast.error(responseMessage);
    } else if (err.message && !suppressErrorToast) {
      toast.error(err.message);
    }
  }
  return { response, error };
};

export default fetchData;
