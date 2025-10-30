"use client";
import HeroBanner from "@/components/home/HeroBanner";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/home/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import Categories from "@/components/home/Categories";
import { useGetNewProductsQuery, useGetRecentPurchasesQuery } from "@/features/products/productApi";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const page = () => {
  // Get authentication state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use single endpoint that handles both cases
  const { data: productsData, isLoading, isError } = useGetRecentPurchasesQuery();
  const products = (productsData?.products || []).filter(product => product && product._id);
  
  const { data: newestData, isLoading: isLoadingNew, isError: isErrorNew } = useGetNewProductsQuery(10);
  const newestProducts = (newestData?.products || []).filter(product => product && product._id);

  return (
    <>
      <Categories />
      <HeroBanner />
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-10">
        <div className="py-4">
          <h2 className="text-3xl font-medium" suppressHydrationWarning>
            {mounted && isAuthenticated ? "Recent Purchases" : "Best Sellers"}
          </h2>
        </div>

        {/* Dynamic Products Swiper - Recent Purchases for logged users, Best Sellers for guests */}
        <div>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading products...
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8">
              Error loading products
            </div>
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              slidesPerView={1.2}
              freeMode={true}
              className="products-swiper"
              breakpoints={{
                480: {
                  slidesPerView: 1.5,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3.5,
                  spaceBetween: 28,
                },
                1280: {
                  slidesPerView: 4.5,
                  spaceBetween: 32,
                },
              }}
            >
              {products.slice(0, 6).map((product) => (
                <SwiperSlide key={product._id} className="border p-2 rounded-lg">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="py-4">
          <h2 className="text-3xl font-medium">This Week's Highlights</h2>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="h-62 w-full overflow-hidden rounded-xl">
              <Image
                src="/img/dryer.png"
                alt="dryer"
                height={500}
                width={500}
                className="h-full w-full object-cover"
              ></Image>
            </div>
            <p className="font-semibold text-xl py-3">
              Free Shipping for all order
            </p>
          </div>
          <div className="w-1/2">
            <div className="h-62 w-full overflow-hidden rounded-xl">
              <Image
                src="/img/dryer.png"
                alt="dryer"
                height={500}
                width={500}
                className="h-full w-full object-cover"
              ></Image>
            </div>
            <p className="font-semibold text-xl py-3">
              25% off for Denim collection
            </p>
          </div>
        </div>
      </section>

      <section className="cta-banner container relative mx-auto px-4 sm:px-6 lg:px-16 py-10">
        {/* Overlay Card */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-md w-full rounded-xl bg-background/90 backdrop-blur shadow-lg border p-6 md:p-8 text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-semibold">Fresh Arrivals Are Here</h3>
            <div className="flex items-center justify-center gap-4">
              <Link href="/shop" passHref>
                <Button size="lg">Shop now</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[60vh] w-full rounded-xl overflow-hidden">
          <Image
            src={"/img/Frame 186.png"}
            alt="dryer"
            height={500}
            width={500}
            className="h-full w-full object-cover object-[center_30%]"
          ></Image>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-10">
        <div className="py-4">
          <h2 className="text-3xl font-medium">New for you</h2>
        </div>

        {/* New for you Swiper (newest first) */}
        {isLoadingNew ? (
          <div className="text-center text-muted-foreground py-8">
            Loading products...
          </div>
        ) : isErrorNew ? (
          <div className="text-center text-red-500 py-8">
            Error loading products
          </div>
        ) : (
          <Swiper
            modules={[FreeMode]}
            spaceBetween={16}
            slidesPerView={1.2}
            freeMode={true}
            className="products-swiper"
            breakpoints={{
              480: {
                slidesPerView: 1.5,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2.2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2.5,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3.5,
                spaceBetween: 28,
              },
              1280: {
                slidesPerView: 4.5,
                spaceBetween: 32,
              },
            }}
          >
            {newestProducts.map((product) => (
              <SwiperSlide key={product._id} className="border p-2 rounded-lg">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>
    </>
  );
};

export default page;
