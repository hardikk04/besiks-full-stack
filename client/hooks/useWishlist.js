import { useSelector, useDispatch } from "react-redux";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistCountQuery, useCheckWishlistStatusQuery, wishlistApi } from "@/features/wishlist/wishlistApi";
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

  // Check if product is in wishlist (optionally with variant)
  const isInWishlist = (productId, variantId = null, variantSku = null, variantOptions = null) => {
    const wishlist = getCurrentWishlist();
    const products = wishlist.products || [];
    const items = wishlist.items || [];
    
    // For authenticated users, check items array for more accurate variant matching
    if (isAuthenticated && items.length > 0) {
      return items.some(item => {
        const itemProductId = item.product?._id || item.product?.toString() || String(item.product);
        if (itemProductId !== String(productId)) return false;
        
        // If variant identifiers provided, match them
        if (variantId && item.variantId) {
          return item.variantId === variantId;
        }
        if (variantSku && item.variantSku) {
          return item.variantSku === variantSku;
        }
        if (variantOptions && item.variantOptions) {
          const itemOptionsStr = JSON.stringify(item.variantOptions);
          const checkOptionsStr = JSON.stringify(variantOptions);
          return itemOptionsStr === checkOptionsStr;
        }
        
        // For simple products or if no variant info provided, just check product ID
        return !variantId && !variantSku && !variantOptions;
      });
    }
    
    // For guest wishlist or fallback, check products array
    return products.some(product => {
      if (product._id !== productId) return false;
      
      // If variant identifiers provided, match them
      if (variantId && product.variantId) {
        return product.variantId === variantId;
      }
      if (variantSku && product.variantSku) {
        return product.variantSku === variantSku;
      }
      if (variantOptions && product.variantOptions) {
        const productOptionsStr = JSON.stringify(product.variantOptions);
        const checkOptionsStr = JSON.stringify(variantOptions);
        return productOptionsStr === checkOptionsStr;
      }
      
      // For simple products or if no variant info provided, just check product ID
      return !variantId && !variantSku && !variantOptions;
    });
  };

  // Add product to wishlist
  const addToWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        const wishlistData = {
          productId: product._id,
        };
        
        // Include variant information for variable products
        if (product.productType === "variable" && product.selectedVariant) {
          wishlistData.variantSku = product.selectedVariant.sku || product.sku;
          wishlistData.variantOptions = product.selectedVariantOptions || product.selectedVariant.options;
          wishlistData.variantId = product.selectedVariant._id?.toString();
        }
        
        await addToWishlistMutation(wishlistData).unwrap();
      } else {
        dispatch(addToGuestWishlist(product));
      }
    } catch (error) {
      // Error handling without toast
    }
  };

  // Remove product from wishlist (optionally with variant)
  const removeFromWishlist = async (productId, variantId = null, variantSku = null, variantOptions = null) => {
    try {
      if (isAuthenticated) {
        // Build query params for variant removal
        const params = new URLSearchParams();
        if (variantId) params.append("variantId", variantId);
        if (variantSku) params.append("variantSku", variantSku);
        if (variantOptions) params.append("variantOptions", JSON.stringify(variantOptions));
        
        const url = `/remove/${productId}${params.toString() ? `?${params.toString()}` : ""}`;
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/wishlist${url}`, {
          method: "DELETE",
          credentials: "include",
        });
        // Manually invalidate wishlist cache
        dispatch(wishlistApi.util.invalidateTags(["Wishlist"]));
      } else {
        dispatch(removeFromGuestWishlist(productId));
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
