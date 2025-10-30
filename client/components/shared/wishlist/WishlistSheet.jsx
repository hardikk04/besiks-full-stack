"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Heart, X, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

const WishlistSheet = ({ isOpen, onOpenChange, wishlistCount = 0 }) => {
  const { wishlist, wishlistCount: actualWishlistCount, isLoading, isError, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering wishlist count on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const wishlistProducts = wishlist.products || [];
  const totalItems = actualWishlistCount;

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleMoveToCart = async (product) => {
    await addToCart(product, 1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-blue-600 relative cursor-pointer"
        >
          <Heart strokeWidth={2} className="!h-5 !w-5" />
          {isClient && totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
            >
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Wishlist</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] flex flex-col"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-semibold">
            Wishlist
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground">Loading wishlist...</div>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-red-500">Error loading wishlist</div>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Add some products to your wishlist
            </p>
            <Button className="w-full cursor-pointer" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {wishlistProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {product.category?.name || 'No category'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{product.price?.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Stock Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? 'In stock' : 'Out of stock'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleMoveToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          asChild
                        >
                          <Link href={`/product/${product._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wishlist Summary */}
            <div className="border-t py-4 space-y-4 px-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in wishlist
                </span>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/wishlist">
                    View Full Wishlist
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WishlistSheet;
