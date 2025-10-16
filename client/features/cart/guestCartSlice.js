import { createSlice } from "@reduxjs/toolkit";

// Function to get initial guest cart from localStorage
const getInitialGuestCart = () => {
  if (typeof window === "undefined") {
    return {
      items: [],
      totalPrice: 0,
      totalItems: 0,
    };
  }

  try {
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart) {
      return JSON.parse(guestCart);
    }
  } catch (error) {
    console.error("Error loading guest cart from localStorage:", error);
    localStorage.removeItem("guestCart");
  }

  return {
    items: [],
    totalPrice: 0,
    totalItems: 0,
  };
};

const initialState = getInitialGuestCart();

const guestCartSlice = createSlice({
  name: "guestCart",
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      // Check if product already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === product._id
      );

      if (existingItemIndex > -1) {
        // Update quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images,
            stock: product.stock,
            isActive: product.isActive,
            category: product.category,
          },
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0],
        });
      }

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestCart", JSON.stringify(state));
      }
    },

    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(
        (item) => item.product._id === productId
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }

        // Update totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("guestCart", JSON.stringify(state));
        }
      }
    },

    removeFromGuestCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId
      );

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestCart", JSON.stringify(state));
      }
    },

    clearGuestCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("guestCart");
      }
    },

    mergeGuestCart: (state, action) => {
      // This will be called when user logs in to merge guest cart with user cart
      // The actual merging logic will be handled in the cart API
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("guestCart");
      }
    },
  },
});

export const {
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  mergeGuestCart,
} = guestCartSlice.actions;

export default guestCartSlice.reducer;
