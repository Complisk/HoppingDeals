"use client";

import { useApi } from "@/presentation/hooks/useApi";
export const useSubscriptionService = () => {
  const { call } = useApi();
  const checkout = async (months) => {
    const { response, error } = await call("/subscription/checkout", {
      method: "POST",
      data: { months },
    });
    if (error) throw new Error(error);
    return response;
  };
  const getActive = async () => {
    const { response, error } = await call("/subscription/active", {
      method: "GET",
    });
    if (error) throw new Error(error);
    return response || null;
  };
  const getHistory = async (page = 1, limit = 20) => {
    const { response, error } = await call(
      `/subscription/history?page=${page}&limit=${limit}`,
      { method: "GET" },
    );
    if (error) throw new Error(error);
    return response;
  };
  return { checkout, getActive, getHistory };
};
export default useSubscriptionService;
