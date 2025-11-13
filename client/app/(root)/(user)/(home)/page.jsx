"use client";
import HeroBanner from "@/components/home/HeroBanner";
import React, { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/home/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import Categories from "@/components/home/Categories";
import { useGetNewProductsQuery, useGetRecentPurchasesQuery } from "@/features/products/productApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import SearchResults from "@/components/shared/search/SearchResults";
import { useSelector } from "react-redux";
import { useGetSettingsQuery } from "@/features/appSettings/appSettingsApi";

const page = () => {
  // Get authentication state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Besiks - Home";
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
  };
  
  // Use single endpoint that handles both cases
  const { data: productsData, isLoading, isError } = useGetRecentPurchasesQuery();
  const products = (productsData?.products || []).filter(product => product && product._id);
  
  const { data: newestData, isLoading: isLoadingNew, isError: isErrorNew } = useGetNewProductsQuery(10);
  const newestProducts = (newestData?.products || []).filter(product => product && product._id);
  
  // Get weekly highlights and promo banner from app settings
  const { data: settingsData } = useGetSettingsQuery();
  const weeklyHighlights = (settingsData?.data?.weeklyHighlights || []).filter(highlight => highlight?.image);
  const promoBanner = settingsData?.data?.promoBanner;

  // Ref for New for you swiper
  const newForYouSwiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Ref for Best Sellers/Recent Purchases swiper
  const bestSellersSwiperRef = useRef(null);
  const [isBeginningBestSellers, setIsBeginningBestSellers] = useState(true);
  const [isEndBestSellers, setIsEndBestSellers] = useState(false);

  return (
    <>
      {/* Mobile Search Bar - Only visible on mobile devices */}
      <div className="md:hidden container mx-auto px-4 sm:px-6 lg:px-16 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for products..."
            className="pl-10 pr-4 w-full border-gray-200 rounded-lg"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {showSearchResults && (
            <SearchResults 
              query={searchQuery} 
              onClose={closeSearchResults}
            />
          )}
        </div>
      </div>

      <Categories />
      <HeroBanner />
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 max-sm:py-2 py-10">
        <div className="py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-medium" suppressHydrationWarning>
            {mounted && isAuthenticated ? "Recent Purchases" : "Best Sellers"}
          </h2>
          
          {/* Navigation Arrows */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => bestSellersSwiperRef.current?.slidePrev()}
                disabled={isBeginningBestSellers}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isBeginningBestSellers
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className={`w-5 h-5 ${isBeginningBestSellers ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
              <button
                onClick={() => bestSellersSwiperRef.current?.slideNext()}
                disabled={isEndBestSellers}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isEndBestSellers
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className={`w-5 h-5 ${isEndBestSellers ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
            </div>
          )}
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
              modules={[FreeMode, Navigation]}
              spaceBetween={16}
              slidesPerView={2}
              freeMode={true}
              className="products-swiper"
              onSwiper={(swiper) => {
                bestSellersSwiperRef.current = swiper;
                setIsBeginningBestSellers(swiper.isBeginning);
                setIsEndBestSellers(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginningBestSellers(swiper.isBeginning);
                setIsEndBestSellers(swiper.isEnd);
              }}
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

      {weeklyHighlights.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="py-4">
            <h2 className="text-xl md:text-3xl font-medium">This Week's Highlights</h2>
          </div>
          <div className={`grid gap-4 ${
            weeklyHighlights.length === 1 
              ? 'grid-cols-1' 
              : weeklyHighlights.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {weeklyHighlights.map((highlight, index) => {
              const isExternal = highlight.link && (highlight.link.startsWith('http://') || highlight.link.startsWith('https://') || highlight.link.startsWith('//'));
              
              const HighlightContent = (
                <>
                  <div className="h-62 w-full overflow-hidden rounded-xl relative aspect-[4/3]">
                    <Image
                      src={highlight.image}
                      alt={highlight.text || `Weekly Highlight ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {highlight.text && (
                    <p className="font-semibold text-base md:text-xl py-3 cursor-pointer hover:text-primary transition-colors">
                      {highlight.text}
                    </p>
                  )}
                </>
              );

              if (highlight.link) {
                if (isExternal) {
                  return (
                    <a
                      key={index}
                      href={highlight.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-90 transition-opacity"
                    >
                      {HighlightContent}
                    </a>
                  );
                } else {
                  return (
                    <Link key={index} href={highlight.link} className="block hover:opacity-90 transition-opacity">
                      {HighlightContent}
                    </Link>
                  );
                }
              }

              return (
                <div key={index}>
                  {HighlightContent}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {promoBanner?.image && (
        <section className="cta-banner container relative mx-auto px-4 sm:px-6 lg:px-16 py-10">
          {/* Overlay Card */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
            <div className="pointer-events-auto w-[85%] sm:max-w-md sm:w-full rounded-xl bg-background/90 backdrop-blur shadow-lg border p-6 md:p-8 text-center space-y-4">
              {promoBanner.text && (
                <h3 className="text-2xl md:text-3xl font-semibold">{promoBanner.text}</h3>
              )}
              {promoBanner.link && (
                <div className="flex items-center justify-center gap-4">
                  {(() => {
                    const isExternal = promoBanner.link.startsWith('http://') || promoBanner.link.startsWith('https://') || promoBanner.link.startsWith('//');
                    
                    if (isExternal) {
                      return (
                        <a href={promoBanner.link} target="_blank" rel="noopener noreferrer">
                          <Button size="lg">Shop now</Button>
                        </a>
                      );
                    } else {
                      return (
                        <Link href={promoBanner.link} passHref>
                          <Button size="lg">Shop now</Button>
                        </Link>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
          <div className="h-[60vh] w-full rounded-xl overflow-hidden relative">
            <Image
              src={promoBanner.image}
              alt={promoBanner.text || "Promo Banner"}
              fill
              className="object-cover object-[center_30%]"
              priority
            />
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pb-10">
        <div className="py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-medium">New for you</h2>
          
          {/* Navigation Arrows */}
          {!isLoadingNew && !isErrorNew && newestProducts.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => newForYouSwiperRef.current?.slidePrev()}
                disabled={isBeginning}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isBeginning
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className={`w-5 h-5 ${isBeginning ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
              <button
                onClick={() => newForYouSwiperRef.current?.slideNext()}
                disabled={isEnd}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isEnd
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className={`w-5 h-5 ${isEnd ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
            </div>
          )}
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
            modules={[FreeMode, Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            freeMode={true}
            className="products-swiper"
            onSwiper={(swiper) => {
              newForYouSwiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
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
