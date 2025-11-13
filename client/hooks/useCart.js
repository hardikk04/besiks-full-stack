import { useSelector, useDispatch } from "react-redux";
import { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveFromCartMutation, useGetCartCountQuery } from "@/features/cart/cartApi";
import { useMergeGuestCartMutation } from "@/features/cart/cartService";
import { useCreateOrderMutation } from "@/features/orders/orderApi";
import { addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, mergeGuestCart } from "@/features/cart/guestCartSlice";
import { useCartContext } from "@/components/providers/CartProvider";
import { toast } from "sonner";

export const useCart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const guestCart = useSelector((state) => state.guestCart);
  const { openCart } = useCartContext();

  // API hooks for authenticated users
  const { data: cartData, isLoading, isError, refetch: refetchCart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeFromCartMutation] = useRemoveFromCartMutation();
  const { data: cartCountData } = useGetCartCountQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [mergeGuestCartMutation] = useMergeGuestCartMutation();
  const [createOrderMutation] = useCreateOrderMutation();

  // Get current cart data (authenticated or guest)
  const getCurrentCart = () => {
    if (isAuthenticated) {
      return cartData?.data || { items: [], totalPrice: 0, totalItems: 0 };
    }
    return guestCart;
  };

  // Get cart count
  const getCartCount = () => {
    if (isAuthenticated) {
      return cartCountData?.data?.count || 0;
    }
    return guestCart.totalItems;
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      // Check if item is already in cart with max quantity (for authenticated users)
      if (isAuthenticated) {
        const currentCart = getCurrentCart();
        const cartItem = currentCart.items?.find((item) => {
          if (item.product._id === product._id) {
            // For variable products, check variant match
            if (product.productType === "variable" && product.selectedVariant) {
              const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
              const productVariantKey = product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions || product.selectedVariant.options || {});
              return itemVariantKey === productVariantKey;
            }
            // For simple products, just match product ID
            return !item.variantSku;
          }
          return false;
        });

        if (cartItem) {
          const availableStock = product.productType === "variable" && product.selectedVariant 
            ? product.selectedVariant.stock 
            : product.stock;
          
          if (cartItem.quantity >= availableStock) {
            toast.info(`This item is already in your cart with maximum available quantity (${availableStock})`);
            openCart(); // Open cart to show the item
            return;
          }
        }
      }

      // Prepare cart item data
      const cartItemData = {
        productId: product._id,
        quantity,
      };

      // Add variant information if it's a variable product
      if (product.productType === "variable" && product.selectedVariant) {
        cartItemData.variantSku = product.selectedVariant.sku || product.sku;
        cartItemData.variantOptions = product.selectedVariantOptions || product.selectedVariant.options;
        cartItemData.variantId = product.selectedVariant._id?.toString();
      }

      if (isAuthenticated) {
        await addToCartMutation(cartItemData).unwrap();
        openCart(); // Open cart sheet after successful addition
      } else {
        // For guest cart, check before adding
        const currentCart = getCurrentCart();
        const cartItem = currentCart.items?.find((item) => {
          if (item.product._id === product._id) {
            // For variable products, check variant match
            if (product.productType === "variable" && product.selectedVariant) {
              const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
              const productVariantKey = product.selectedVariant.sku || JSON.stringify(product.selectedVariantOptions || product.selectedVariant.options || {});
              return itemVariantKey === productVariantKey;
            }
            // For simple products, just match product ID
            return !item.variantSku;
          }
          return false;
        });

        if (cartItem) {
          const availableStock = product.productType === "variable" && product.selectedVariant 
            ? product.selectedVariant.stock 
            : product.stock;
          
          if (cartItem.quantity >= availableStock) {
            toast.info(`This item is already in your cart with maximum available quantity (${availableStock})`);
            openCart(); // Open cart to show the item
            return;
          }
        }

        dispatch(addToGuestCart({ product, quantity }));
        openCart(); // Open cart sheet after successful addition
      }
    } catch (error) {
      // Show error message from backend
      const errorMessage = error?.data?.message || error?.message || "Failed to add item to cart";
      toast.error(errorMessage);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity, variantSku = null, variantOptions = null) => {
    try {
      if (isAuthenticated) {
        await updateCartItemMutation({
          productId,
          quantity,
          variantSku,
          variantOptions,
        }).unwrap();
      } else {
        dispatch(updateGuestCartItem({ productId, quantity, variantSku, variantOptions }));
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update cart");
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, variantSku = null, variantOptions = null, variantId = null) => {
    try {
      if (isAuthenticated) {
        const removeData = { productId };
        if (variantId) removeData.variantId = variantId;
        if (variantSku) removeData.variantSku = variantSku;
        if (variantOptions) removeData.variantOptions = variantOptions;
        await removeFromCartMutation(removeData).unwrap();
      } else {
        dispatch(removeFromGuestCart({ productId, variantSku, variantOptions, variantId }));
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove item");
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // This would need to be implemented in the API
        toast.success("Cart cleared");
      } else {
        dispatch(clearGuestCart());
        toast.success("Cart cleared");
      }
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  // Merge guest cart when user logs in
  const mergeGuestCartOnLogin = async () => {
    if (isAuthenticated && guestCart.items.length > 0) {
      try {
        console.log('Merging guest cart items:', guestCart.items);
        await mergeGuestCartMutation(guestCart.items).unwrap();
        dispatch(mergeGuestCart());
        toast.success("Guest cart merged with your account");
      } catch (error) {
        console.error('Cart merge error:', error);
        toast.error("Failed to merge guest cart");
      }
    }
  };

  // Create order from cart
  const createOrderFromCart = async (orderData) => {
    try {
      const result = await createOrderMutation(orderData).unwrap();
      return result;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  return {
    cart: getCurrentCart(),
    cartCount: getCartCount(),
    isLoading,
    isError,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCartOnLogin,
    createOrderFromCart,
    refetchCart: isAuthenticated ? refetchCart : null,
    isAuthenticated,
  };
};
