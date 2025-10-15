import React from "react";
import CategoriesCard from "./CategoriesCard";
import { useGetAllCategoriesQuery, useGetFeaturedCategoriesQuery } from "@/features/category/categoryApi";
import Link from "next/link";

const Categories = () => {
  const { data: categoriesData, isLoading, isError } = useGetAllCategoriesQuery();
  const { data: featuredCategoriesData, isLoading: featuredLoading, isError: featuredError } = useGetFeaturedCategoriesQuery();
  
  // Prioritize featured categories, fallback to all categories
  const featuredCategories = (featuredCategoriesData?.categories || []).filter(category => category && category._id);
  const allCategories = (categoriesData?.categories || []).filter(category => category && category._id);
  const categories = featuredCategories.length > 0 ? featuredCategories : allCategories;

  if (isLoading || featuredLoading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center text-muted-foreground">Loading categories...</div>
        </div>
      </section>
    );
  }

  if (isError || featuredError) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center text-red-500">Error loading categories</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="container mx-auto scrollbar-hide gap-6 px-4 sm:px-6 lg:px-16 flex justify-between">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link key={category._id} href={`/shop/category/${category._id}`}>
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
    </section>
  );
};

export default Categories;
