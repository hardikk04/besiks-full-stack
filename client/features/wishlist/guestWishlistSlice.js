import { createSlice } from "@reduxjs/toolkit";

// Function to get initial guest wishlist from localStorage
const getInitialGuestWishlist = () => {
  if (typeof window === "undefined") {
    return {
      products: [],
      totalItems: 0,
    };
  }

  try {
    const guestWishlist = localStorage.getItem("guestWishlist");
    if (guestWishlist) {
      return JSON.parse(guestWishlist);
    }
  } catch (error) {
    console.error("Error loading guest wishlist from localStorage:", error);
    localStorage.removeItem("guestWishlist");
  }

  return {
    products: [],
    totalItems: 0,
  };
};

const initialState = getInitialGuestWishlist();

const guestWishlistSlice = createSlice({
  name: "guestWishlist",
  initialState,
  reducers: {
    addToGuestWishlist: (state, action) => {
      const product = action.payload;
      
      // Check if product already exists in wishlist
      const productExists = state.products.some(
        (item) => item._id === product._id
      );

      if (!productExists) {
        // Add new product
        state.products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          stock: product.stock,
          isActive: product.isActive,
          rating: product.rating,
          numReviews: product.numReviews,
          category: product.category,
        });
      }

      // Update total items
      state.totalItems = state.products.length;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestWishlist", JSON.stringify(state));
      }
    },

    removeFromGuestWishlist: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter(
        (product) => product._id !== productId
      );

      // Update total items
      state.totalItems = state.products.length;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestWishlist", JSON.stringify(state));
      }
    },

    clearGuestWishlist: (state) => {
      state.products = [];
      state.totalItems = 0;

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("guestWishlist");
      }
    },

    mergeGuestWishlist: (state, action) => {
      // This will be called when user logs in to merge guest wishlist with user wishlist
      // The actual merging logic will be handled in the wishlist API
      state.products = [];
      state.totalItems = 0;

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("guestWishlist");
      }
    },
  },
});

export const {
  addToGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  mergeGuestWishlist,
} = guestWishlistSlice.actions;

export default guestWishlistSlice.reducer;
