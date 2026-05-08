"use client";

import { useApi } from "@/presentation/hooks/useApi";
/**
 * Template Service - Centralized template API layer
 * Uses the unified useApi hook for all template API calls
 */
export const useTemplateService = () => {
  const { call } = useApi();
  // Get all available templates (admin uploaded)
  const getTemplates = async () => {
    try {
      const response = await call(
        "/promotions/templates",
        {
          method: "GET",
        },
        null,
        true, // Public endpoint - not protected
      );
      if (response) {
        return response;
      }
      return [];
    } catch (error) {
      console.error("Get templates error:", error);
      throw error;
    }
  };
  return {
    getTemplates,
  };
};
export default useTemplateService;
