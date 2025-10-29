import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
    credentials: "include",
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => "/",
      providesTags: ["Order"],
    }),
    getMyOrders: builder.query({
      query: () => "/myorders",
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Order"],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrderToDelivered: builder.mutation({
      query: (id) => ({
        url: `/${id}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),
    confirmPayment: builder.mutation({
      query: ({ id, paymentData }) => ({
        url: `/${id}/confirm-payment`,
        method: "PUT",
        body: paymentData,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderToDeliveredMutation,
  useConfirmPaymentMutation,
} = orderApi;
