import React from "react";
import CategoriesCard from "./CategoriesCard";
import {
  useGetAllCategoriesQuery,
  useGetFeaturedCategoriesQuery,
} from "@/features/category/categoryApi";
import Link from "next/link";

const Categories = () => {
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useGetAllCategoriesQuery();
  const {
    data: featuredCategoriesData,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useGetFeaturedCategoriesQuery();

  // Prioritize featured categories, fallback to all categories
  const featuredCategories = (featuredCategoriesData?.categories || []).filter(
    (category) => category && category._id
  );
  const allCategories = (categoriesData?.categories || []).filter(
    (category) => category && category._id
  );
  const categories =
    featuredCategories.length > 0 ? featuredCategories : allCategories;

  if (isLoading || featuredLoading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center text-muted-foreground">
            Loading categories...
          </div>
        </div>
      </section>
    );
  }

  if (isError || featuredError) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center text-red-500">
            Error loading categories
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:py-10 pt-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/shop/category/${category.slug || category._id}`}
                className="flex-shrink-0 w-[calc((100%-0.5rem)/3.5)] md:w-auto"
              >
                <CategoriesCard
                  title={category.name}
                  img={category.image || "/img/dryer.png"}
                />
              </Link>
            ))
          ) : (
            <div className="text-center text-muted-foreground w-full">
              No categories available
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
