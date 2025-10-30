import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Add null check for product
  if (!product) {
    return (
      <div className="card w-full h-full flex flex-col">
        <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-200 animate-pulse">
        </div>
        <div className="product-info py-4 flex flex-col gap-2 flex-1">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="mt-auto">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  return (
    <Link href={`/product/${product._id}`} className="card w-full h-full flex flex-col">
      <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
        <Image
          src={product.images?.[0] || "/img/product.png"}
          alt={product.name || "Product"}
          height={500}
          width={500}
          className="h-full w-full object-cover"
        ></Image>
      </div>
      <div className="product-info py-4 flex flex-col gap-2 flex-1">
        <h3 className="text-base sm:text-md font-semibold leading-tight h-5 flex line-clamp-1">{product.name || "Unnamed Product"}</h3>
        <p className="text-gray-600 text-sm sm:text-base">Price: ₹{product.price || 0}</p>
        <div className="mt-auto">
          <Button 
            className="w-full bg-[#174986] hover:bg-[#174986]/90 text-sm sm:text-base cursor-pointer"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
