import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const wishlistService = createApi({
  reducerPath: "wishlistService",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/wishlist`,
    credentials: "include",
  }),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    mergeGuestWishlist: builder.mutation({
      query: (guestWishlistProducts) => ({
        url: "/merge-guest-wishlist",
        method: "POST",
        body: { guestWishlistProducts },
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useMergeGuestWishlistMutation,
} = wishlistService;
