import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    credentials: "include",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => "/",
      providesTags: ["Category"],
    }),
    getCategoryById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Category"],
    }),
    getFeaturedCategories: builder.query({
      query: () => "/featured",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (categoryInput) => ({
        url: "/",
        method: "POST", 
        body: categoryInput,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, categoryInput }) => ({
        url: `/${id}`,
        method: "PUT",
        body: categoryInput,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    updateIsActive: builder.mutation({
      query: (categoryId) => ({
        url: `/${categoryId}/status`,
        method: "PUT",
      }),
      invalidatesTags: ["Category"],
    }),
    searchCategory: builder.query({
      query: (searchQuery) => `/search?search=${searchQuery}`,
    }),
    getProductsByCategory: builder.query({
      query: (categoryIdOrSlug) => `/${categoryIdOrSlug}/products`,
      providesTags: ["Category"],
    }),
    getCategoryBySlug: builder.query({
      query: (slug) => `/slug/${slug}`,
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useDeleteCategoryMutation,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useUpdateCategoryMutation,
  useUpdateIsActiveMutation,
  useSearchCategoryQuery,
  useGetProductsByCategoryQuery,
} = categoryApi;
