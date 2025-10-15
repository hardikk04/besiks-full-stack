import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAddToCartMutation } from "@/features/cart/cartApi";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const [addToCart, { isLoading }] = useAddToCartMutation();

  // Add null check for product
  if (!product) {
    return (
      <div className="card w-full block">
        <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-200 animate-pulse">
        </div>
        <div className="product-info py-4 flex flex-col gap-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      }).unwrap();
      toast.success("Product added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <Link href={`/product/${product._id}`} className="card w-full block">
      <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
        <Image
          src={product.images?.[0] || "/img/product.png"}
          alt={product.name || "Product"}
          height={500}
          width={500}
          className="h-full w-full object-cover"
        ></Image>
      </div>
      <div className="product-info py-4 flex flex-col gap-2">
        <h3 className="text-base sm:text-lg font-semibold">{product.name || "Unnamed Product"}</h3>
        <p className="text-gray-600 text-sm sm:text-base">Price: ₹{product.price || 0}</p>
        <Button 
          className="w-full bg-[#174986] text-sm sm:text-base"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;
