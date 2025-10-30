import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
    credentials: "include",
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => "/",
      providesTags: ["Products"],
    }),
    getProductById: builder.query({
      query: (productId) => `/${productId}`,
      providesTags: ["Products"],
    }),
    getNewProducts: builder.query({
      query: (limit = 10) => `/new?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getRecentPurchases: builder.query({
      query: (limit = 10) => `/recent-purchases?limit=${limit}`,
      providesTags: ["Products"],
    }),
    getBestSellers: builder.query({
      query: (limit = 10) => `/best-sellers?limit=${limit}`,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation({
      query: (productInput) => ({
        url: "/",
        method: "POST",
        body: productInput,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, productInput }) => ({
        url: `/${id}`,
        method: "PUT",
        body: productInput,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    updateIsActive: builder.mutation({
      query: (productId) => ({
        url: `/${productId}/status`,
        method: "PUT",
      }),
      invalidatesTags: ["Products"],
    }),
    searchProduct: builder.query({
      query: (searchQuery) => `/search?query=${searchQuery}`,
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetNewProductsQuery,
  useGetRecentPurchasesQuery,
  useGetBestSellersQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useUpdateIsActiveMutation,
  useSearchProductQuery,
} = productApi;
