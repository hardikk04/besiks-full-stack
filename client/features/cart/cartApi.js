import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    credentials: "include",
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (cartItem) => ({
        url: "/add",
        method: "POST",
        body: cartItem,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: (updateData) => ({
        url: "/update",
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: (data) => {
        // Support both old format (just productId string) and new format (object with variant info)
        const productId = typeof data === "string" ? data : data.productId;
        const params = new URLSearchParams();
        
        if (typeof data === "object" && data.variantId) {
          params.append("variantId", data.variantId);
        }
        if (typeof data === "object" && data.variantSku) {
          params.append("variantSku", data.variantSku);
        }
        if (typeof data === "object" && data.variantOptions) {
          params.append("variantOptions", JSON.stringify(data.variantOptions));
        }
        
        const queryString = params.toString();
        return {
          url: `/remove/${productId}${queryString ? `?${queryString}` : ""}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    getCartCount: builder.query({
      query: () => "/count",
      providesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartCountQuery,
} = cartApi;
