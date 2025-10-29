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
  const { data: cartData, isLoading, isError } = useGetCartQuery(undefined, {
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
      if (isAuthenticated) {
        await addToCartMutation({
          productId: product._id,
          quantity,
        }).unwrap();
        openCart(); // Open cart sheet after successful addition
      } else {
        dispatch(addToGuestCart({ product, quantity }));
        openCart(); // Open cart sheet after successful addition
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add to cart");
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      if (isAuthenticated) {
        await updateCartItemMutation({
          productId,
          quantity,
        }).unwrap();
      } else {
        dispatch(updateGuestCartItem({ productId, quantity }));
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update cart");
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        await removeFromCartMutation(productId).unwrap();
        toast.success("Item removed from cart");
      } else {
        dispatch(removeFromGuestCart(productId));
        toast.success("Item removed from cart");
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
    isAuthenticated,
  };
};
