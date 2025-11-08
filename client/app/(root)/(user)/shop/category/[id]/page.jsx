"use client";

import React, { Suspense, useMemo, useCallback, memo, startTransition, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAllCategoriesQuery, useGetFeaturedCategoriesQuery } from "@/features/category/categoryApi";
import { useGetProductsByCategorySlugQuery } from "@/features/products/productApi";

// Memoized Products Grid Component - only re-renders when products change
const ProductsGrid = memo(({ products }) => {
  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product._id} className="border p-2 rounded-lg h-full">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
});

ProductsGrid.displayName = "ProductsGrid";

// Memoized Hero Section - only re-renders when category name or product count changes
const CategoryHero = memo(({ categoryName, productCount, filters, activeFilter, onFilterClick, categoryImage }) => {
  const backgroundImage = categoryImage || "/img/dryershop.png";
  
  return (
    <section className="relative py-8 px-4 sm:px-6 lg:px-16 h-[70vh] overflow-hidden container mx-auto">
      <div
        className="shop-hero h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>

        {/* Category Title */}
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {categoryName || "Category"}
          </h1>
          <p className="text-white/80 mt-2">
            {productCount} product{productCount !== 1 ? 's' : ''} available
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
                    onClick={() => onFilterClick(filter)}
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
                onClick={() => onFilterClick(filter)}
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
  );
});

CategoryHero.displayName = "CategoryHero";

// Component that uses useParams - needs to be wrapped in Suspense
const CategoryContent = () => {
  const router = useRouter();
  const params = useParams();
  // Support both slug and id for backward compatibility
  const initialCategorySlug = params.id;
  
  // State to track selected category slug - allows client-side filtering without full page remount
  const [selectedCategorySlug, setSelectedCategorySlug] = React.useState(initialCategorySlug);
  
  // Update selected category when route param changes (e.g., direct navigation)
  React.useEffect(() => {
    setSelectedCategorySlug(initialCategorySlug);
  }, [initialCategorySlug]);

  // Update URL in background when selectedCategorySlug changes (without causing remount)
  React.useEffect(() => {
    if (selectedCategorySlug && selectedCategorySlug !== initialCategorySlug) {
      // Use startTransition to make URL update non-blocking
      startTransition(() => {
        router.replace(`/shop/category/${selectedCategorySlug}`, { scroll: false });
      });
    }
  }, [selectedCategorySlug, initialCategorySlug, router]);

  // API calls - use slug to fetch products
  const { data: categoryProductsData, isLoading: categoryProductsLoading } = useGetProductsByCategorySlugQuery(selectedCategorySlug, {
    skip: !selectedCategorySlug,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: featuredCategoriesData, isLoading: featuredCategoriesLoading } = useGetFeaturedCategoriesQuery();

  // Memoize categories computation
  const categories = useMemo(() => {
    const allCategories = categoriesData?.categories || [];
    const featuredCategories = featuredCategoriesData?.categories || [];
    return featuredCategories.length > 0 ? featuredCategories : allCategories;
  }, [categoriesData, featuredCategoriesData]);

  // Memoize filters array
  const filters = useMemo(() => {
    return ["All", ...categories.map(cat => cat.name)];
  }, [categories]);

  // Memoize current category based on selectedCategorySlug
  // Try to find by slug first, then fall back to id for backward compatibility
  const currentCategory = useMemo(() => {
    return categories.find(cat => cat.slug === selectedCategorySlug || cat._id === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  // Set dynamic page title
  useEffect(() => {
    if (currentCategory) {
      document.title = `Besiks - ${currentCategory.name}`;
    } else {
      document.title = "Besiks - Category";
    }
  }, [currentCategory]);

  // Memoize products array - this is the key optimization
  const filteredProducts = useMemo(() => {
    return categoryProductsData?.products || [];
  }, [categoryProductsData]);

  // Memoize active filter
  const activeFilter = useMemo(() => {
    return currentCategory?.name || "All";
  }, [currentCategory]);

  // Memoize category name to prevent hero re-render when only products change
  // IMPORTANT: Must be before any conditional returns to follow Rules of Hooks
  const categoryName = useMemo(() => {
    return currentCategory?.name || "Category";
  }, [currentCategory?.name]);

  // Memoize filter click handler - update state immediately (no page remount)
  const handleFilterClick = useCallback((filterName) => {
    if (filterName === "All") {
      router.push("/shop", { scroll: false });
    } else {
      const selectedCategory = categories.find(cat => cat.name === filterName);
      // Use slug if available, otherwise fall back to id
      const categoryIdentifier = selectedCategory?.slug || selectedCategory?._id;
      if (selectedCategory && categoryIdentifier !== selectedCategorySlug) {
        // Update state immediately (triggers API call, no page remount)
        setSelectedCategorySlug(categoryIdentifier);
        // URL will be updated in background via useEffect
      }
    }
  }, [router, categories, selectedCategorySlug]);

  // Show loading state (must be after all hooks)
  if (categoriesLoading || featuredCategoriesLoading || categoryProductsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      <CategoryHero
        categoryName={categoryName}
        productCount={filteredProducts.length}
        filters={filters}
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
        categoryImage={currentCategory?.image}
      />

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

        {/* Products Grid - only this section will re-render when products change */}
        <ProductsGrid products={filteredProducts} />
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
