import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tagApi = createApi({
  reducerPath: "tagApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tags`,
    credentials: "include",
  }),
  tagTypes: ["Tag"],
  endpoints: (builder) => ({
    getAllTags: builder.query({
      query: () => "/",
      providesTags: ["Tag"],
    }),
    getTagById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Tag"],
    }),
    createTag: builder.mutation({
      query: (tagData) => ({
        url: "/",
        method: "POST",
        body: tagData,
      }),
      invalidatesTags: ["Tag"],
    }),
    updateTag: builder.mutation({
      query: ({ id, ...tagData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: tagData,
      }),
      invalidatesTags: ["Tag"],
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tag"],
    }),
  }),
});

export const {
  useGetAllTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
