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
      
      // For variable products, use variant SKU or options to identify unique items
      const itemIdentifier = product.productType === "variable" && product.selectedVariant
        ? `${product._id}_${product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions)}`
        : product._id;
      
      // Check if product (or variant) already exists in cart
      const existingItemIndex = state.items.findIndex((item) => {
        if (item.product._id === product._id) {
          // For variable products, check variant match
          if (product.productType === "variable" && product.selectedVariant) {
            const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions);
            const productVariantKey = product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions);
            return itemVariantKey === productVariantKey;
          }
          // For simple products, just match product ID
          return !item.variantSku;
        }
        return false;
      });

      if (existingItemIndex > -1) {
        // Update quantity - check stock limit
        const item = state.items[existingItemIndex];
        const availableStock = item.product?.stock || 0;
        const newQuantity = item.quantity + quantity;
        
        if (newQuantity > availableStock) {
          // Set to maximum available stock
          state.items[existingItemIndex].quantity = availableStock;
        } else {
          state.items[existingItemIndex].quantity = newQuantity;
        }
      } else {
        // Add new item
        const cartItem = {
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images,
            stock: product.stock,
            isActive: product.isActive,
            category: product.category,
            productType: product.productType,
            tax: product.tax || "0",
          },
          quantity,
          price: product.price,
          name: product.name,
          image: product.images?.[0] || product.selectedVariant?.image || "/img/product.png",
        };

        // Add variant information for variable products
        if (product.productType === "variable" && product.selectedVariant) {
          cartItem.variantSku = product.selectedVariant.sku;
          cartItem.variantOptions = product.selectedVariantOptions || product.selectedVariant.options;
          cartItem.variantId = product.selectedVariant._id?.toString();
          // Use variant price and stock
          cartItem.price = product.selectedVariant.price;
          cartItem.product.stock = product.selectedVariant.stock;
        }

        state.items.push(cartItem);
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
      const { productId, quantity, variantSku, variantOptions } = action.payload;
      const itemIndex = state.items.findIndex((item) => {
        if (item.product._id !== productId) return false;
        
        // For variable products, match by variant
        if (variantSku || variantOptions) {
          const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
          const requestVariantKey = variantSku || JSON.stringify(variantOptions || {});
          return itemVariantKey === requestVariantKey;
        }
        
        // For simple products, just match product ID
        return !item.variantSku;
      });

      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          // Check stock limit
          const item = state.items[itemIndex];
          const availableStock = item.product?.stock || 0;
          
          if (quantity > availableStock) {
            // Set to maximum available stock
            state.items[itemIndex].quantity = availableStock;
          } else {
            state.items[itemIndex].quantity = quantity;
          }
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
      const { productId, variantSku, variantOptions, variantId } = typeof action.payload === 'object' 
        ? action.payload 
        : { productId: action.payload };
      
      // Find item to remove (by productId and optionally by variant)
      const itemIndex = state.items.findIndex(item => {
        if (item.product._id !== productId) return false;
        
        // If variant identifier provided, match it
        if (variantId) {
          return item.variantId === variantId;
        }
        if (variantSku) {
          return item.variantSku === variantSku;
        }
        if (variantOptions) {
          const itemOptionsStr = item.variantOptions ? JSON.stringify(item.variantOptions) : '';
          const queryOptionsStr = JSON.stringify(variantOptions);
          return itemOptionsStr === queryOptionsStr;
        }
        
        // If no variant identifier, remove first match (for simple products)
        return !item.variantSku;
      });

      if (itemIndex > -1) {
        state.items.splice(itemIndex, 1);
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

    removeDeletedProducts: (state, action) => {
      // Remove products that no longer exist (by product IDs)
      const deletedProductIds = action.payload; // Array of product IDs
      if (!Array.isArray(deletedProductIds) || deletedProductIds.length === 0) {
        return;
      }

      const deletedIdsSet = new Set(deletedProductIds.map(id => String(id)));
      state.items = state.items.filter(item => {
        const productId = String(item.product?._id || item.product);
        return !deletedIdsSet.has(productId);
      });

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
  },
});

export const {
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  mergeGuestCart,
  removeDeletedProducts,
} = guestCartSlice.actions;

export default guestCartSlice.reducer;
