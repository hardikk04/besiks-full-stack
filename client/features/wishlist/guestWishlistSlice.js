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
      
      // For variable products, use variant SKU or options to identify unique items
      const itemIdentifier = product.productType === "variable" && product.selectedVariant
        ? `${product._id}_${product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions)}`
        : product._id;
      
      // Check if product (or variant) already exists in wishlist
      const productExists = state.products.some((item) => {
        if (item._id === product._id) {
          // For variable products, check variant match
          if (product.productType === "variable" && product.selectedVariant) {
            const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
            const productVariantKey = product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions || {});
            return itemVariantKey === productVariantKey;
          }
          // For simple products, just match product ID
          return !item.variantSku;
        }
        return false;
      });

      if (!productExists) {
        // Add new product
        const wishlistItem = {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          stock: product.stock,
          isActive: product.isActive,
          rating: product.rating,
          numReviews: product.numReviews,
          category: product.category,
          productType: product.productType,
        };

        // Add variant information for variable products
        if (product.productType === "variable" && product.selectedVariant) {
          wishlistItem.variantSku = product.selectedVariant.sku;
          wishlistItem.variantOptions = product.selectedVariantOptions || product.selectedVariant.options;
          wishlistItem.variantId = product.selectedVariant._id?.toString();
          wishlistItem.price = product.selectedVariant.price;
          wishlistItem.stock = product.selectedVariant.stock;
        }

        state.products.push(wishlistItem);
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

    removeDeletedProducts: (state, action) => {
      // Remove products that no longer exist (by product IDs)
      const deletedProductIds = action.payload; // Array of product IDs
      if (!Array.isArray(deletedProductIds) || deletedProductIds.length === 0) {
        return;
      }

      const deletedIdsSet = new Set(deletedProductIds.map(id => String(id)));
      state.products = state.products.filter(product => {
        const productId = String(product._id);
        return !deletedIdsSet.has(productId);
      });

      // Update total items
      state.totalItems = state.products.length;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestWishlist", JSON.stringify(state));
      }
    },
  },
});

export const {
  addToGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  mergeGuestWishlist,
  removeDeletedProducts,
} = guestWishlistSlice.actions;

export default guestWishlistSlice.reducer;
