import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isLoading: false,
    error: null,
    successMessage: null,
    featuredPromotions: [],
    featuredLoading: false,
    featuredError: null,
};
const promotionSlice = createSlice({
    name: "promotion",
    initialState,
    reducers: {
        // Create promotion actions
        setPromotionLoading: (state) => {
            state.isLoading = true;
            state.error = null;
            state.successMessage = null;
        },
        setPromotionSuccess: (state, action) => {
            state.isLoading = false;
            state.error = null;
            state.successMessage = action.payload;
        },
        setPromotionError: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.successMessage = null;
        },
        clearPromotionState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.successMessage = null;
        },
        clearPromotionError: (state) => {
            state.error = null;
        },
        // Featured promotions actions
        setFeaturedPromotionsLoading: (state) => {
            state.featuredLoading = true;
            state.featuredError = null;
        },
        setFeaturedPromotionsSuccess: (state, action) => {
            state.featuredLoading = false;
            state.featuredError = null;
            state.featuredPromotions = action.payload;
        },
        setFeaturedPromotionsError: (state, action) => {
            state.featuredLoading = false;
            state.featuredError = action.payload;
            state.featuredPromotions = [];
        },
        clearFeaturedPromotions: (state) => {
            state.featuredPromotions = [];
            state.featuredLoading = false;
            state.featuredError = null;
        },
    },
});
export const { setPromotionLoading, setPromotionSuccess, setPromotionError, clearPromotionState, clearPromotionError, setFeaturedPromotionsLoading, setFeaturedPromotionsSuccess, setFeaturedPromotionsError, clearFeaturedPromotions, } = promotionSlice.actions;
export default promotionSlice.reducer;
