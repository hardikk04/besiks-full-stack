"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

const CartMergeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const guestCart = useSelector((state) => state.guestCart);
  const guestWishlist = useSelector((state) => state.guestWishlist);
  const { mergeGuestCartOnLogin } = useCart();
  const { mergeGuestWishlistOnLogin } = useWishlist();

  useEffect(() => {
    console.log('CartMergeProvider effect triggered:', { 
      isAuthenticated, 
      guestCartItems: guestCart.items.length,
      guestWishlistItems: guestWishlist.products.length 
    });
    
    // Only merge if user is authenticated and has guest items
    if (isAuthenticated && (guestCart.items.length > 0 || guestWishlist.products.length > 0)) {
      console.log('Triggering cart and wishlist merge...');
      // Small delay to ensure auth state is fully updated
      const timer = setTimeout(() => {
        mergeGuestCartOnLogin();
        mergeGuestWishlistOnLogin();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, guestCart.items.length, guestWishlist.products.length, mergeGuestCartOnLogin, mergeGuestWishlistOnLogin]);

  return children;
};

export default CartMergeProvider;
