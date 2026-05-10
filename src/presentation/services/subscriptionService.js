"use client";

import { useApi } from "@/presentation/hooks/useApi";
export const useSubscriptionService = () => {
  const { call } = useApi();
  // Backend takes a Subscription Template UUID (Starter/Professional/
  // Enterprise) and returns a Stripe Checkout URL.
  const checkout = async (templateId) => {
    const { response, error } = await call("/subscription/checkout", {
      method: "POST",
      data: { templateId },
    });
    if (error) {
      throw new Error(
        typeof error === "string"
          ? error
          : error?.message || "Could not start checkout",
      );
    }
    return response;
  };

  const listTemplates = async () => {
    const { response, error } = await call("/subscription-template", {
      method: "GET",
    });
    if (error) throw new Error(error);
    return Array.isArray(response) ? response : [];
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
  return { checkout, listTemplates, getActive, getHistory };
};
export default useSubscriptionService;
