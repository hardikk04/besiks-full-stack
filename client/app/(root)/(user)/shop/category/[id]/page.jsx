"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAllCategoriesQuery, useGetFeaturedCategoriesQuery, useGetProductsByCategoryQuery } from "@/features/category/categoryApi";

// Component that uses useParams - needs to be wrapped in Suspense
const CategoryContent = () => {
  const params = useParams();
  const categoryId = params.id;
  
  const [activeFilter, setActiveFilter] = useState("All");

  // API calls
  const { data: categoryProductsData, isLoading: categoryProductsLoading } = useGetProductsByCategoryQuery(categoryId, {
    skip: !categoryId,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: featuredCategoriesData, isLoading: featuredCategoriesLoading } = useGetFeaturedCategoriesQuery();

  // Get categories for filters - prioritize featured categories
  const allCategories = categoriesData?.categories || [];
  const featuredCategories = featuredCategoriesData?.categories || [];
  const categories = featuredCategories.length > 0 ? featuredCategories : allCategories;
  const filters = ["All", ...categories.map(cat => cat.name)];

  // Find the current category
  const currentCategory = categories.find(cat => cat._id === categoryId);

  // Determine which products to show - prioritize category-specific products
  const categoryProducts = categoryProductsData?.products || [];
  const products = categoryProducts;

  // Filter products by category
  const filteredProducts = activeFilter === "All" 
    ? products 
    : products.filter(product => 
        product.categories && product.categories.some(category => category.name === activeFilter)
      );

  // Show loading state
  if (categoriesLoading || featuredCategoriesLoading || categoryProductsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center text-muted-foreground">Loading products...</div>
      </div>
    );
  }

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

          {/* Category Title */}
          <div className="absolute top-8 left-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {currentCategory?.name || "Category"}
            </h1>
            <p className="text-white/80 mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>

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

            {/* Desktop Horizontal Scroll */}
            <div className="hidden pt-4 md:flex overflow-x-auto scrollbar-hide gap-4 lg:gap-8">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-gray-900">Shop</Link>
            <span>/</span>
            <span className="text-gray-900">{currentCategory?.name || "Category"}</span>
          </nav>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="border p-2 rounded-lg h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No products found in this category
            </div>
            <Link 
              href="/shop" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all products
            </Link>
          </div>
        )}
      </section>
    </>
  );
};

// Loading fallback component
const CategoryLoading = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
    <div className="text-center text-muted-foreground">Loading products...</div>
  </div>
);

// Main page component with Suspense boundary
const page = () => {
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryContent />
    </Suspense>
  );
};

export default page;
