"use client";

import { useApi } from "@/presentation/hooks/useApi";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/presentation/lib/errorHandler";
import { setPromotionLoading, setPromotionSuccess, setPromotionError, setFeaturedPromotionsLoading, setFeaturedPromotionsSuccess, setFeaturedPromotionsError, } from "@/presentation/store/promotionSlice";
/**
 * Promotion Service - Centralized promotion API layer
 * Uses the unified useApi hook for all promotion API calls
 * Now handles Redux dispatch internally for promotion state management
 */
export const usePromotionService = () => {
    const { call } = useApi();
    // Create a new promotion
    const createPromotion = async (dispatch, data) => {
        try {
            dispatch(setPromotionLoading());
            const { response, error } = await call("/business/promotions", {
                method: "POST",
                data: data,
            });
            if (error) {
                toast.error(error);
                dispatch(setPromotionError(error));
                throw new Error(error);
            }
            if (response) {
                console.log("Create promotion response:", response);
                // Check if payment is required
                if (response.requiresPayment) {
                    toast.info("Promotion created. Please complete payment to activate.");
                }
                else {
                    toast.success("Promotion created successfully!");
                }
                dispatch(setPromotionSuccess("Promotion created successfully!"));
                // Return full response including clientSecret and requiresPayment
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Create promotion error:", error);
            const errorMessage = error?.message || "Failed to create promotion";
            dispatch(setPromotionError(errorMessage));
            throw new Error(errorMessage);
        }
    };
    // Get all business promotions with optional search filter and status filter
    const getBusinessPromotions = async (search = "", status = "") => {
        try {
            const params = new URLSearchParams();
            if (search.trim()) {
                params.append("search", search);
            }
            if (status.trim()) {
                params.append("status", status);
            }
            const response = await call(`/business/promotions?${params.toString()}`, {
                method: "GET",
            });
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Get business promotions error:", error);
            throw error;
        }
    };
    // Get single promotion
    const getPromotionById = async (promotionId) => {
        try {
            const { response, error } = await call(`/business/promotions/${promotionId}`, {
                method: "GET",
            });
            if (error) {
                return { response: null, error };
            }
            if (response) {
                return { response, error: null };
            }
            return { response: null, error: "Promotion not found" };
        }
        catch (error) {
            const errorMsg = error?.message || "Failed to load promotion";
            console.error("Get promotion error:", error);
            return { response: null, error: errorMsg };
        }
    };
    // Get all public promotions
    const getPromotions = async (filters) => {
        try {
            const params = new URLSearchParams();
            if (filters) {
                if (filters.location)
                    params.append("location", filters.location);
                if (filters.category)
                    params.append("category", filters.category);
                if (filters.state)
                    params.append("state", filters.state);
                if (filters.city)
                    params.append("city", filters.city);
                if (filters.timezone)
                    params.append("timezone", filters.timezone);
            }
            const response = await call(`/promotions?${params.toString()}`, { method: "GET" }, null, true);
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Get promotions error:", error);
            throw error;
        }
    };
    // Calculate promotion price
    const calculatePrice = async (data) => {
        try {
            const response = await call("/promotions/calculate-price", {
                method: "POST",
                body: data,
            }, null, true); // Not protected - public endpoint
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Calculate price error:", error);
            throw error;
        }
    };
    // Update promotion
    const updatePromotion = async (promotionId, data) => {
        try {
            const { response, error } = await call(`/business/promotions/${promotionId}`, {
                method: "PUT",
                data: data,
            });
            if (error) {
                toast.error(error);
                throw new Error(error);
            }
            if (response) {
                toast({
                    title: "Success",
                    description: "Promotion updated successfully!",
                });
                return response;
            }
            return null;
        }
        catch (error) {
            const errorMsg = error?.message || "Failed to update promotion";
            console.error("Update promotion error:", error);
            throw new Error(errorMsg);
        }
    };
    // Delete promotion
    const deletePromotion = async (promotionId) => {
        try {
            const { response, error } = await call(`/business/promotions/${promotionId}`, {
                method: "DELETE",
            });
            if (error) {
                toast.error(error);
                throw new Error(error);
            }
            if (response) {
                toast.success("Promotion deleted successfully!");
                return response;
            }
            return null;
        }
        catch (error) {
            const errorMsg = error?.message || "Failed to delete promotion";
            console.error("Delete promotion error:", error);
            throw new Error(errorMsg);
        }
    };
    // Get templates
    const getTemplates = async () => {
        try {
            const response = await call("/templates", {
                method: "GET",
            }, null, true); // Not protected - public endpoint
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Get templates error:", error);
            throw error;
        }
    };
    // Increment promotion clicks
    const incrementClick = async (promotionId) => {
        try {
            const response = await call(`/promotions/${promotionId}/click`, {
                method: "POST",
            }, null, true); // Not protected - public endpoint
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Increment click error:", error);
            throw error;
        }
    };
    // Get dashboard analytics data
    const getDashboardAnalytics = async () => {
        try {
            const response = await call("/business/dashboard", {
                method: "GET",
            });
            if (response) {
                return response;
            }
            return null;
        }
        catch (error) {
            console.error("Get dashboard analytics error:", error);
            throw error;
        }
    };
    // Activate promotion
    const activatePromotion = async (promotionId) => {
        try {
            const { response, error } = await call(`/business/promotions/${promotionId}/activate`, {
                method: "POST",
            });
            if (error) {
                const errorMessage = extractErrorMessage(error);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
            if (response) {
                toast.success({
                    title: "Success",
                    description: "Promotion activated successfully!",
                });
                return response;
            }
            return null;
        }
        catch (error) {
            const errorMessage = extractErrorMessage(error);
            console.error("Activate promotion error:", error);
            throw new Error(errorMessage);
        }
    };
    // Deactivate promotion
    const deactivatePromotion = async (promotionId) => {
        try {
            const { response, error } = await call(`/business/promotions/${promotionId}/deactivate`, {
                method: "POST",
            });
            if (error) {
                const errorMessage = extractErrorMessage(error);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
            if (response) {
                console.log(response, "check response of api please");
                toast.success({
                    title: "Success",
                    description: "Promotion deactivated successfully!",
                });
                return response;
            }
            return null;
        }
        catch (error) {
            const errorMessage = extractErrorMessage(error);
            console.error("Deactivate promotion error:", error);
            throw new Error(errorMessage);
        }
    };
    // Get featured promotions based on user location
    const getFeaturedPromotions = async (dispatch, locationData) => {
        try {
            dispatch(setFeaturedPromotionsLoading());
            const params = new URLSearchParams();
            // Use provided location data or retrieve from localStorage
            const location = locationData ||
                (() => {
                    try {
                        const stored = localStorage.getItem("userLocation");
                        return stored ? JSON.parse(stored) : null;
                    }
                    catch (e) {
                        console.error("Error parsing stored location:", e);
                        return null;
                    }
                })();
            if (location) {
                if (location.state_code) {
                    params.append("state", location.state_code);
                }
                if (location.city) {
                    params.append("city", location.city);
                }
                if (location.timezone) {
                    params.append("timezone", location.timezone);
                }
            }
            const { response, error } = await call(`/promotions?${params.toString()}`, { method: "GET" }, null, true);
            if (error) {
                const errorMessage = extractErrorMessage(error);
                dispatch(setFeaturedPromotionsError(errorMessage));
                console.error("Get featured promotions error:", error);
                return null;
            }
            if (response) {
                const promotions = Array.isArray(response)
                    ? response
                    : response.data || [];
                dispatch(setFeaturedPromotionsSuccess(promotions));
                return promotions;
            }
            dispatch(setFeaturedPromotionsSuccess([]));
            return [];
        }
        catch (error) {
            const errorMessage = extractErrorMessage(error);
            dispatch(setFeaturedPromotionsError(errorMessage));
            console.error("Get featured promotions error:", error);
            return null;
        }
    };
    return {
        createPromotion,
        getBusinessPromotions,
        getPromotionById,
        getPromotions,
        calculatePrice,
        updatePromotion,
        deletePromotion,
        getTemplates,
        incrementClick,
        getDashboardAnalytics,
        activatePromotion,
        deactivatePromotion,
        getFeaturedPromotions,
    };
};
export default usePromotionService;
