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
    userLogin: builder.mutation({
      query: (loginInput) => ({
        url: "login",
        method: "POST",
        body: loginInput,
      }),
    }),
    adminLogout: builder.query({
      query: () => "admin/logout", // 👈 GET method
    }),
    userLogout: builder.query({
      query: () => "admin/logout", // Same endpoint works for both admin and user
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useUserLoginMutation,
  useLazyAdminLogoutQuery,
  useLazyUserLogoutQuery,
} = authApi;
