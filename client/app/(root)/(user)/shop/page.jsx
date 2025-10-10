"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ProductCard from "@/components/home/ProductCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const page = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    "All",
    "Hairdryer",
    "Straightener",
    "Hair Stylers",
    "Straight",
  ];

  return (
    <>
      <section className="relative py-8 px-4 sm:px-6 lg:px-16 h-[70vh] overflow-hidden container mx-auto">
        <div
          className="shop-hero h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('/img/dryershop.png')",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>

          {/* Filter Buttons at Bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4">
            <div className="line w-full h-[1px] bg-white/20"></div>

            {/* Mobile Swiper */}
            <div className="block md:hidden pt-4">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={16}
                slidesPerView="auto"
                freeMode={true}
                className="filter-swiper"
              >
                {filters.map((filter) => (
                  <SwiperSlide key={filter} className="!w-auto">
                    <button
                      onClick={() => setActiveFilter(filter)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        activeFilter === filter
                          ? "bg-white text-gray-900 shadow-lg"
                          : "text-gray-300"
                      }`}
                    >
                      {filter}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop Grid */}
            <div className="hidden pt-4 md:flex flex-wrap justify-between gap-4 lg:gap-8">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-white text-gray-900 shadow-lg"
                      : "text-gray-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-10">
        {/* Products Swiper */}
        <div>
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
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
            <SwiperSlide className="border p-2 rounded-lg">
              <ProductCard />
            </SwiperSlide>
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default page;
