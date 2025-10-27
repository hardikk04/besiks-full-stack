"use client";

import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const HeroBanner = () => {
  // Sample banner data - you can replace these with your actual banner images
  const banners = [
    {
      id: 1,
      image: "/img/herobanner.png",
      alt: "Hero Banner 1",
    },
    {
      id: 2,
      image: "/img/herobanner.png", // You can add more banner images
      alt: "Hero Banner 2",
    },
    {
      id: 3,
      image: "/img/herobanner.png", // You can add more banner images
      alt: "Hero Banner 3",
    },
  ];

  return (
    <section className="relative w-full pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="w-full rounded-xl overflow-hidden relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: false,
            }}
            className="h-[400px] md:h-[500px] lg:h-[600px] w-full hero-swiper"
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner.id}>
                <div className="relative h-full w-full">
                  <Image
                    src={banner.image}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
