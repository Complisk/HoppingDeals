"use client";

// Centralized API client. Migrated from the old Vite-based one:
//   - base URL is now a relative "/api" (same-origin in Next), so cookie auth
//     just works without CORS configuration
//   - JWT lives in an httpOnly cookie, so we don't need Authorization headers
//     and don't read tokens from localStorage anymore

import axios from "axios";
import { toast } from "react-toastify";

const baseUrl = "/api";

const fetchData = async (url, options = {}, callBack, _notProtected) => {
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
    error = err.response?.data || { message: err.message };
    if (callBack) callBack(err.response?.data, false);

    if (err.response?.status === 403) {
      const message =
        err.response?.data?.message ||
        "You don't have permission to perform this action";
      toast.error(message);
      return { response, error };
    }

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else if (err.message) {
      toast.error(err.message);
    }
  }
  return { response, error };
};

export default fetchData;
