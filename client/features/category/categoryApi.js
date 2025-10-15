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
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateIsActiveMutation,
  useSearchCategoryQuery,
} = categoryApi;
