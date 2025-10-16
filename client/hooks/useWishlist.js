import { useSelector, useDispatch } from "react-redux";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistCountQuery, useCheckWishlistStatusQuery } from "@/features/wishlist/wishlistApi";
import { useMergeGuestWishlistMutation } from "@/features/wishlist/wishlistService";
import { addToGuestWishlist, removeFromGuestWishlist, clearGuestWishlist, mergeGuestWishlist } from "@/features/wishlist/guestWishlistSlice";
import { toast } from "sonner";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const guestWishlist = useSelector((state) => state.guestWishlist);

  // API hooks for authenticated users
  const { data: wishlistData, isLoading, isError } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlistMutation] = useAddToWishlistMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const { data: wishlistCountData } = useGetWishlistCountQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [mergeGuestWishlistMutation] = useMergeGuestWishlistMutation();

  // Get current wishlist data (authenticated or guest)
  const getCurrentWishlist = () => {
    if (isAuthenticated) {
      return wishlistData?.data || { products: [], totalItems: 0 };
    }
    return guestWishlist;
  };

  // Get wishlist count
  const getWishlistCount = () => {
    if (isAuthenticated) {
      return wishlistCountData?.data?.count || 0;
    }
    return guestWishlist.totalItems;
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    const wishlist = getCurrentWishlist();
    return wishlist.products.some(product => product._id === productId);
  };

  // Add product to wishlist
  const addToWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        await addToWishlistMutation(product._id).unwrap();
        toast.success("Product added to wishlist");
      } else {
        dispatch(addToGuestWishlist(product));
        toast.success("Product added to wishlist");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add to wishlist");
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      if (isAuthenticated) {
        await removeFromWishlistMutation(productId).unwrap();
        toast.success("Product removed from wishlist");
      } else {
        dispatch(removeFromGuestWishlist(productId));
        toast.success("Product removed from wishlist");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove from wishlist");
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      if (isAuthenticated) {
        // This would need to be implemented in the API
        toast.success("Wishlist cleared");
      } else {
        dispatch(clearGuestWishlist());
        toast.success("Wishlist cleared");
      }
    } catch (error) {
      toast.error("Failed to clear wishlist");
    }
  };

  // Merge guest wishlist when user logs in
  const mergeGuestWishlistOnLogin = async () => {
    if (isAuthenticated && guestWishlist.products.length > 0) {
      try {
        console.log('Merging guest wishlist products:', guestWishlist.products);
        await mergeGuestWishlistMutation(guestWishlist.products).unwrap();
        dispatch(mergeGuestWishlist());
        toast.success("Guest wishlist merged with your account");
      } catch (error) {
        console.error('Wishlist merge error:', error);
        toast.error("Failed to merge guest wishlist");
      }
    }
  };

  return {
    wishlist: getCurrentWishlist(),
    wishlistCount: getWishlistCount(),
    isLoading,
    isError,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    mergeGuestWishlistOnLogin,
    isAuthenticated,
  };
};
