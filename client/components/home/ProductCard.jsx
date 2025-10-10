import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const ProductCard = () => {
  return (
    <Link href={"/product/dryer"} className="card w-full block">
      <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
        <Image
          src="/img/product.png"
          alt="dryer"
          height={500}
          width={500}
          className="h-full w-full object-cover"
        ></Image>
      </div>
      <div className="product-info py-4 flex flex-col gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Dryer</h3>
        <p className="text-gray-600 text-sm sm:text-base">Price: 500</p>
        <Button className="w-full bg-[#174986] text-sm sm:text-base">
          Add to Cart
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;
