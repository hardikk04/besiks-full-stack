import React from "react";
import CategoriesCard from "./CategoriesCard";

const Categories = () => {
  return (
    <section className="py-10">
      <div className="container mx-auto scrollbar-hide gap-6 px-4 sm:px-6 lg:px-16 flex justify-between">
        <CategoriesCard title="Dryer" img="/img/dryer.png" />
        <CategoriesCard title="Straightner" img="/img/Straightner.jpg" />
        <CategoriesCard title="Curler" img="/img/Curler.jpg" />
        <CategoriesCard title="Sets" img="/img/Sets.jpg" />
        <CategoriesCard title="Brushes" img="/img/Brushes.jpg" />
        <CategoriesCard title="Dryer" img="/img/dryer.png" />
        <CategoriesCard title="Straightner" img="/img/Straightner.jpg" />
      </div>
    </section>
  );
};

export default Categories;
