import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (adminLoginInput) => ({
        url: "admin/login",
        method: "POST",
        body: adminLoginInput,
      }),
    }),
    logout: builder.query({
      query: () => "admin/logout", // 👈 GET method
    }),
  }),
});

export const { useAdminLoginMutation, useLazyLogoutQuery } = authApi;
