import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/wishlist`,
    credentials: "include",
  }),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => "/",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: (data) => ({
        url: "/add",
        method: "POST",
        body: typeof data === "string" ? { productId: data } : data, // Support both old and new format
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/remove/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    clearWishlist: builder.mutation({
      query: () => ({
        url: "/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    checkWishlistStatus: builder.query({
      query: (productId) => `/check/${productId}`,
      providesTags: ["Wishlist"],
    }),
    getWishlistCount: builder.query({
      query: () => "/count",
      providesTags: ["Wishlist"],
    }),
    moveToCart: builder.mutation({
      query: (productId) => ({
        url: `/move-to-cart/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist", "Cart"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useCheckWishlistStatusQuery,
  useGetWishlistCountQuery,
  useMoveToCartMutation,
} = wishlistApi;
