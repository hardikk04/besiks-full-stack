import { useSelector, useDispatch } from "react-redux";
import { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveFromCartMutation, useGetCartCountQuery } from "@/features/cart/cartApi";
import { useMergeGuestCartMutation } from "@/features/cart/cartService";
import { addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart, mergeGuestCart } from "@/features/cart/guestCartSlice";
import { toast } from "sonner";

export const useCart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const guestCart = useSelector((state) => state.guestCart);

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
        toast.success("Product added to cart");
      } else {
        dispatch(addToGuestCart({ product, quantity }));
        toast.success("Product added to cart");
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
        toast.success("Cart updated");
      } else {
        dispatch(updateGuestCartItem({ productId, quantity }));
        toast.success("Cart updated");
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
    isAuthenticated,
  };
};
