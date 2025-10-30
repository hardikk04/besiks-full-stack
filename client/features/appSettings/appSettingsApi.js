import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appSettingsApi = createApi({
  reducerPath: "appSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
    credentials: "include",
  }),
  tagTypes: ["AppSettings"],
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/",
      providesTags: ["AppSettings"],
    }),
    createSettings: builder.mutation({
      query: (settingsData) => ({
        url: "/",
        method: "POST",
        body: settingsData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updateLogo: builder.mutation({
      query: (logoData) => ({
        url: "/logo",
        method: "PUT",
        body: logoData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updateHeroBanners: builder.mutation({
      query: (bannersData) => ({
        url: "/hero-banners",
        method: "PUT",
        body: bannersData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updateWeeklyHighlights: builder.mutation({
      query: (highlightsData) => ({
        url: "/weekly-highlights",
        method: "PUT",
        body: highlightsData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updatePromoBanner: builder.mutation({
      query: (promoData) => ({
        url: "/promo-banner",
        method: "PUT",
        body: promoData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updateCTA: builder.mutation({
      query: (ctaData) => ({
        url: "/cta",
        method: "PUT",
        body: ctaData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
    updateMegaMenu: builder.mutation({
      query: (megaMenuData) => ({
        url: "/mega-menu",
        method: "PUT",
        body: megaMenuData,
      }),
      invalidatesTags: ["AppSettings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateLogoMutation,
  useUpdateHeroBannersMutation,
  useUpdateWeeklyHighlightsMutation,
  useUpdatePromoBannerMutation,
  useUpdateCTAMutation,
  useUpdateMegaMenuMutation,
} = appSettingsApi;
