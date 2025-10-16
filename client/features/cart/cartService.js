import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartService = createApi({
  reducerPath: "cartService",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    credentials: "include",
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    mergeGuestCart: builder.mutation({
      query: (guestCartItems) => ({
        url: "/merge-guest-cart",
        method: "POST",
        body: { guestCartItems },
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useMergeGuestCartMutation,
} = cartService;
