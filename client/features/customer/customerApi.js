import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/users`,
    credentials: "include",
  }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getAllCustomers: builder.query({
      query: () => "all",
      providesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: "delete",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Customer"],
    }),
    getMe: builder.query({
      query: () => "/profile",
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useDeleteCustomerMutation,
  useGetMeQuery,
} = customerApi;
