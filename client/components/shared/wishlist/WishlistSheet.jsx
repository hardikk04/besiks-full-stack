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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, X, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

const WishlistSheet = ({ isOpen, onOpenChange, wishlistCount = 0 }) => {
  const { wishlist, wishlistCount: actualWishlistCount, isLoading, isError, removeFromWishlist, isAuthenticated } = useWishlist();
  const { addToCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [addingToCartProduct, setAddingToCartProduct] = useState(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Prevent hydration mismatch by only rendering wishlist count on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter out products that are null or don't exist (deleted products)
  const wishlistProducts = (() => {
    const products = wishlist.products || [];
    // For authenticated users, also check items array if it exists
    if (isAuthenticated && wishlist.items) {
      // Filter items where product is not null, then map to products
      return wishlist.items
        .filter(item => item.product !== null && item.product !== undefined)
        .map(item => {
          // Handle both Mongoose documents (with toObject) and plain objects
          const productData = typeof item.product.toObject === 'function' 
            ? item.product.toObject() 
            : item.product;
          return {
            ...productData,
            variantSku: item.variantSku,
            variantOptions: item.variantOptions,
            variantId: item.variantId,
          };
        });
    }
    // For guest wishlist, filter products that have _id
    return products.filter(product => product && product._id);
  })();
  const totalItems = actualWishlistCount;

  const handleRemoveFromWishlist = async (productId, variantId = null) => {
    await removeFromWishlist(productId, variantId);
  };

  const handleMoveToCart = async (product) => {
    try {
      // For variable products, find and use the variant
      if (product.productType === "variable") {
        let matchingVariant = null;
        let variantOptions = null;
        
        // Check if variantOptions is an object (selected variant stored in wishlist)
        if (product.variantOptions && typeof product.variantOptions === 'object' && !Array.isArray(product.variantOptions) && Object.keys(product.variantOptions).length > 0) {
          // Use the stored variant selection
          variantOptions = product.variantOptions;
          matchingVariant = product.variants?.find(variant => {
            if (!variant.options) return false;
            return Object.keys(product.variantOptions).every(key => {
              return variant.options[key] === product.variantOptions[key];
            });
          });
        }
        
        // If no variant found, find first available variant
        if (!matchingVariant && product.variants && product.variants.length > 0) {
          // First try to find an available variant (in stock)
          matchingVariant = product.variants.find(v => 
            v.isActive !== false && 
            v.stock > 0 && 
            v.options
          );
          
          if (matchingVariant) {
            variantOptions = matchingVariant.options;
          } else {
            // If no available variant, use first active variant
            matchingVariant = product.variants.find(v => 
              v.isActive !== false && 
              v.options
            );
            
            if (matchingVariant) {
              variantOptions = matchingVariant.options;
            }
          }
        }
        
        if (matchingVariant && variantOptions) {
          // Add directly to cart with the variant
          const productWithVariant = {
            ...product,
            selectedVariant: matchingVariant,
            selectedVariantOptions: variantOptions,
            price: matchingVariant.price,
            stock: matchingVariant.stock,
            sku: matchingVariant.sku || product.sku,
          };
          await addToCart(productWithVariant, 1);
          // Remove from wishlist after successful add to cart
          // Pass variantId if available for variable products
          await handleRemoveFromWishlist(product._id, product.variantId);
        }
        return;
      }
      
      // For simple products, add directly
      await addToCart(product, 1);
      // Remove from wishlist after successful add to cart
      await handleRemoveFromWishlist(product._id);
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  };

  // Find matching variant when options change
  useEffect(() => {
    if (addingToCartProduct?.variants?.length > 0) {
      // Check if variantOptions is an array (product definition) or object (selected variant)
      const variantOptionsArray = Array.isArray(addingToCartProduct.variantOptions) 
        ? addingToCartProduct.variantOptions 
        : null;
      
      if (variantOptionsArray && variantOptionsArray.length > 0) {
        const allSelected = variantOptionsArray.every(option => 
          option && selectedVariantOptions[option.name]
        );
        
        if (allSelected) {
          const matchingVariant = addingToCartProduct.variants.find(variant => {
            if (!variant.options) return false;
            return variantOptionsArray.every(option => {
              return option && variant.options[option.name] === selectedVariantOptions[option.name];
            });
          });
          setSelectedVariant(matchingVariant || null);
        } else {
          setSelectedVariant(null);
        }
      } else if (addingToCartProduct.variantOptions && typeof addingToCartProduct.variantOptions === 'object' && !Array.isArray(addingToCartProduct.variantOptions)) {
        // If variantOptions is an object (selected variant), find matching variant directly
        const matchingVariant = addingToCartProduct.variants.find(variant => {
          if (!variant.options) return false;
          return Object.keys(addingToCartProduct.variantOptions).every(key => {
            return variant.options[key] === addingToCartProduct.variantOptions[key];
          });
        });
        setSelectedVariant(matchingVariant || null);
      }
    }
  }, [selectedVariantOptions, addingToCartProduct]);

  const handleVariantOptionChange = (attributeName, value) => {
    setSelectedVariantOptions(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleAddToCartFromWishlist = async () => {
    if (!selectedVariant || !addingToCartProduct) {
      return;
    }
    
    const productWithVariant = {
      ...addingToCartProduct,
      selectedVariant: selectedVariant,
      selectedVariantOptions: selectedVariantOptions,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      sku: selectedVariant.sku || addingToCartProduct.sku,
    };
    
    await addToCart(productWithVariant, 1);
    setAddingToCartProduct(null);
    setSelectedVariantOptions({});
    setSelectedVariant(null);
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
              className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
            >
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Wishlist</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[80vw] sm:w-[400px] md:w-[450px] flex flex-col overflow-x-hidden"
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
            <Heart strokeWidth={2} className="h-16 w-16 text-gray-300 mb-4" />
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 px-4">
              {wishlistProducts.map((product) => {
                // For variable products, find the matching variant to get correct stock
                let currentStock = product.stock || 0;
                let currentPrice = product.price;
                
                if (product.productType === "variable" && product.variantOptions && product.variants) {
                  const matchingVariant = product.variants.find(variant => {
                    if (!variant.options) return false;
                    return Object.keys(product.variantOptions).every(key => {
                      return variant.options[key] === product.variantOptions[key];
                    });
                  });
                  
                  if (matchingVariant) {
                    currentStock = matchingVariant.stock || 0;
                    currentPrice = matchingVariant.price || product.price;
                  }
                }
                
                const productUrl = `/product/${product.slug || product._id}`;
                
                return (
                <div
                  key={product._id + (product.variantId || "")}
                  className="flex gap-3 p-3 border border-gray-200 rounded-lg min-w-0"
                >
                  {/* Product Image - Clickable */}
                  <Link 
                    href={productUrl}
                    onClick={() => onOpenChange(false)}
                    className="flex-shrink-0"
                  >
                    <Image
                      src={(() => {
                        // For variable products with selected variant, use variant featured image
                        if (product.selectedVariant?.images?.length > 0) {
                          const variantImages = product.selectedVariant.images;
                          const variantFeaturedIndex = product.selectedVariant.featuredImageIndex !== undefined ? product.selectedVariant.featuredImageIndex : 0;
                          return variantImages[variantFeaturedIndex] || variantImages[0] || "/placeholder.jpg";
                        }
                        // Otherwise use product featured image
                        const productImages = product.images || [];
                        const productFeaturedIndex = product.featuredImageIndex !== undefined ? product.featuredImageIndex : 0;
                        return productImages[productFeaturedIndex] || productImages[0] || "/placeholder.jpg";
                      })()}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link 
                          href={productUrl}
                          onClick={() => onOpenChange(false)}
                          className="block"
                        >
                          <h4 className="font-medium text-gray-900 text-sm leading-tight break-words hover:text-blue-600 transition-colors cursor-pointer">
                            {product.name}
                          </h4>
                        </Link>
                        {product.category?.name && (
                          <p className="text-sm text-gray-500">
                            {product.category.name}
                          </p>
                        )}
                        {/* Show variant information if it's a variable product */}
                        {product.productType === "variable" && product.variantOptions && Object.keys(product.variantOptions).length > 0 && (
                          <div className="mt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {Object.entries(product.variantOptions).map(([key, value]) => (
                                <span key={key} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.productType === "variable" && (!product.variantOptions || Object.keys(product.variantOptions).length === 0) && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">
                              Variable product - Select variant when adding to cart
                            </p>
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-900">
                          {product.productType === "variable" && product.variantOptions && Object.keys(product.variantOptions).length > 0
                            ? `₹${currentPrice?.toLocaleString() || "0"}`
                            : product.productType === "variable"
                            ? (() => {
                                const activeVariants = product.variants?.filter(v => v.isActive !== false && v.price != null && v.price > 0) || [];
                                if (activeVariants.length > 0) {
                                  const prices = activeVariants.map(v => Number(v.price) || 0).filter(p => p > 0);
                                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                  return `₹${minPrice.toLocaleString()}+`;
                                }
                                return "Price varies";
                              })()
                            : `₹${product.price?.toLocaleString()}`
                          }
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(product._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Stock Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs whitespace-nowrap ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentStock > 0 ? `In stock (${currentStock})` : 'Out of stock'}
                        </span>
                      </div>

                      {/* Move to Cart Button */}
                      <Button
                        size="sm"
                        className="text-xs flex-shrink-0 bg-[#174986] hover:bg-[#174986]/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToCart(product);
                        }}
                        disabled={currentStock <= 0 && product.productType === "simple"}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
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

      {/* Variant Selection Modal for Adding to Cart */}
      {addingToCartProduct && addingToCartProduct.productType === "variable" && (
        <Dialog 
          open={!!addingToCartProduct} 
          onOpenChange={(open) => {
            if (!open) {
              setAddingToCartProduct(null);
              setSelectedVariantOptions({});
              setSelectedVariant(null);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Variant - {addingToCartProduct.name}</DialogTitle>
              <DialogDescription>
                Select your preferred options to add to cart
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {Array.isArray(addingToCartProduct.variantOptions) && addingToCartProduct.variantOptions.length > 0 ? (
                addingToCartProduct.variantOptions.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {option.name} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedVariantOptions[option.name] || ""}
                      onValueChange={(value) => handleVariantOptionChange(option.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(option.values) && option.values.map((value) => {
                          // Check if this value is available
                          const isAvailable = addingToCartProduct.variants?.some(v => 
                            v.isActive !== false && 
                            v.stock > 0 && 
                            v.options && 
                            v.options[option.name] === value
                          );
                          
                          return (
                            <SelectItem 
                              key={value} 
                              value={value}
                              disabled={!isAvailable}
                              className={!isAvailable ? "opacity-50" : ""}
                            >
                              {value} {!isAvailable && "(Out of stock)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No variant options available for this product.
                </div>
              )}

              {selectedVariant && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="flex items-center gap-2">
                      {selectedVariant.mrp && Number(selectedVariant.mrp) > Number(selectedVariant.price) && (
                        <span className="text-sm text-gray-400 line-through">₹{selectedVariant.mrp.toFixed(2)}</span>
                      )}
                      <span className="text-lg font-semibold text-gray-900">₹{selectedVariant.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`text-sm font-medium ${selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : "Out of stock"}
                    </span>
                  </div>
                </div>
              )}

              {!selectedVariant && Object.keys(selectedVariantOptions).length > 0 && (
                <div className="text-sm text-amber-600 pt-2">
                  Please select all options to see price and availability
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddingToCartProduct(null);
                  setSelectedVariantOptions({});
                  setSelectedVariant(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCartFromWishlist}
                disabled={!selectedVariant || (selectedVariant && selectedVariant.stock <= 0)}
                className="flex-1 bg-[#174986] hover:bg-[#174986]/90"
              >
                Add to Cart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
};

export default WishlistSheet;
