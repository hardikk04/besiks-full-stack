import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCart } from "./useCart";
import { setCredentials, logout } from "@/features/auth/authSlice";

export const useAuthWithCart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { mergeGuestCartOnLogin } = useCart();

  // Handle cart merging when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure auth state is fully updated
      const timer = setTimeout(() => {
        mergeGuestCartOnLogin();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, mergeGuestCartOnLogin]);

  // Enhanced login function that handles cart merging
  const loginWithCartMerge = (user, token) => {
    dispatch(setCredentials({ user, token }));
    // Cart merging will be handled by the useEffect above
  };

  // Enhanced logout function
  const logoutWithCartClear = () => {
    dispatch(logout());
    // Guest cart will be available again after logout
  };

  return {
    loginWithCartMerge,
    logoutWithCartClear,
    isAuthenticated,
  };
};
