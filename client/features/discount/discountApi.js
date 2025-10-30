const { createApi, fetchBaseQuery } = require("@reduxjs/toolkit/query/react");

export const discountApi = createApi({
  reducerPath: "discountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/coupons`,
    credentials: "include",
  }),
  tagTypes: ["Discount"],
  endpoints: (builder) => ({
    getAllCoupon: builder.query({
      query: () => "/",
      providesTags: ["Discount"],
    }),
    getCouponById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Discount"],
    }),
    createDiscount: builder.mutation({
      query: (discountInput) => ({
        url: "/",
        method: "POST",
        body: discountInput,
      }),
      invalidatesTags: ["Discount"],
    }),
    updateDiscount: builder.mutation({
      query: ({ id, discountInput }) => ({
        url: `/${id}`,
        method: "PUT",
        body: discountInput,
      }),
      invalidatesTags: ["Discount"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Discount"],
    }),
    updateIsActive: builder.mutation({
      query: (discountId) => ({
        url: `/${discountId}/status`,
        method: "PUT",
      }),
      invalidatesTags: ["Discount"],
    }),
  }),
});

export const {
  useCreateDiscountMutation,
  useGetAllCouponQuery,
  useGetCouponByIdQuery,
  useDeleteCouponMutation,
  useUpdateIsActiveMutation,
  useUpdateDiscountMutation,
} = discountApi;
