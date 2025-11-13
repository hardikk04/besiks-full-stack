"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useGetSettingsQuery } from "@/features/appSettings/appSettingsApi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const HeroBanner = () => {
  const { data: settingsData } = useGetSettingsQuery();
  const heroBanners = settingsData?.data?.heroBanners || [];
  
  // Filter banners that have images
  const banners = heroBanners.filter(banner => banner?.image);

  // If no banners, don't render anything
  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="container mx-auto px-4 max-sm:pt-6 sm:px-6 lg:px-16">
        <div className="w-full rounded-xl overflow-hidden relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={banners.length > 1}
            autoplay={
              banners.length > 1
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                  }
                : false
            }
            pagination={{
              clickable: true,
              dynamicBullets: false,
            }}
            className="h-[200px] md:h-[500px] lg:h-[600px] w-full hero-swiper"
          >
            {banners.map((banner, index) => {
              const BannerContent = (
                <div className="relative h-full w-full cursor-pointer">
                  <Image
                    src={banner.image}
                    alt={banner.text || `Hero Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              );

              // If banner has a link, make it clickable
              if (banner.link) {
                // Check if it's an external URL
                const isExternal = banner.link.startsWith('http://') || banner.link.startsWith('https://') || banner.link.startsWith('//');
                
                if (isExternal) {
                  return (
                    <SwiperSlide key={index}>
                      <a 
                        href={banner.link} 
                        className="block h-full w-full"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {BannerContent}
                      </a>
                    </SwiperSlide>
                  );
                } else {
                  return (
                    <SwiperSlide key={index}>
                      <Link href={banner.link} className="block h-full w-full">
                        {BannerContent}
                      </Link>
                    </SwiperSlide>
                  );
                }
              }

              // Otherwise, just render the image
              return (
                <SwiperSlide key={index}>
                  {BannerContent}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
