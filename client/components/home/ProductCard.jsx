import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  
  // Variable product state
  const [selectedVariantOptions, setSelectedVariantOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

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

  // Initialize variant selection when modal opens
  useEffect(() => {
    if (isVariantModalOpen && product?.productType === "variable" && product?.variantOptions?.length > 0) {
      // Only initialize if no options are selected yet
      if (Object.keys(selectedVariantOptions).length === 0) {
        const initialOptions = {};
        product.variantOptions.forEach(option => {
          if (option.values && option.values.length > 0) {
            // Find first available value
            const availableValue = option.values.find(value => {
              return product.variants?.some(v => 
                v.isActive !== false && 
                v.stock > 0 && 
                v.options[option.name] === value
              );
            });
            if (availableValue) {
              initialOptions[option.name] = availableValue;
            } else if (option.values.length > 0) {
              // If no available value, just use first one
              initialOptions[option.name] = option.values[0];
            }
          }
        });
        setSelectedVariantOptions(initialOptions);
      }
    }
  }, [isVariantModalOpen, product]);

  // Find matching variant when options change
  useEffect(() => {
    if (product?.productType === "variable" && product?.variants?.length > 0) {
      const allSelected = product.variantOptions?.every(option => 
        selectedVariantOptions[option.name]
      );
      
      if (allSelected) {
        const matchingVariant = product.variants.find(variant => {
          if (!variant.options) return false;
          return product.variantOptions.every(option => {
            return variant.options[option.name] === selectedVariantOptions[option.name];
          });
        });
        setSelectedVariant(matchingVariant || null);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedVariantOptions, product]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For variable products, always open modal to select variant
    if (product.productType === "variable") {
      setIsVariantModalOpen(true);
      return;
    }
    
    // For simple products, add directly to cart
    await addToCart(product, 1);
  };

  const handleVariantOptionChange = (attributeName, value) => {
    setSelectedVariantOptions(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleAddToCartFromModal = async () => {
    if (!selectedVariant) {
      return;
    }
    
    const productWithVariant = {
      ...product,
      selectedVariant: selectedVariant,
      selectedVariantOptions: selectedVariantOptions,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      sku: selectedVariant.sku || product.sku,
    };
    await addToCart(productWithVariant, 1);
    setIsVariantModalOpen(false);
  };

  const isVariableProduct = product.productType === "variable";
  const variantOptions = product?.variantOptions || [];
  const variants = product?.variants || [];
  
  // Get current price based on selected variant
  const currentPrice = isVariableProduct && selectedVariant 
    ? selectedVariant.price 
    : product?.price || 0;
  const currentMrp = isVariableProduct && selectedVariant 
    ? selectedVariant.mrp 
    : product?.mrp;
  const currentStock = isVariableProduct && selectedVariant 
    ? selectedVariant.stock 
    : product?.stock || 0;

  // For display on card - show minimum price and corresponding MRP for variable products
  const displayPrice = isVariableProduct && !selectedVariant
    ? (() => {
        const activeVariants = variants.filter(v => v.isActive !== false && v.price != null && v.price > 0);
        if (activeVariants.length > 0) {
          const prices = activeVariants.map(v => Number(v.price) || 0).filter(p => p > 0);
          return prices.length > 0 ? Math.min(...prices) : product?.price || 0;
        }
        return product?.price || 0;
      })()
    : currentPrice;

  const displayMrp = isVariableProduct && !selectedVariant
    ? (() => {
        // Find the variant with minimum price and use its MRP
        const activeVariants = variants.filter(v => v.isActive !== false && v.price != null && v.price > 0);
        if (activeVariants.length > 0) {
          // Find variant with minimum price
          const minPriceVariant = activeVariants.reduce((min, v) => {
            const vPrice = Number(v.price) || 0;
            const minPrice = Number(min.price) || 0;
            return vPrice < minPrice ? v : min;
          });
          // Return MRP of the variant with minimum price
          return minPriceVariant?.mrp ? Number(minPriceVariant.mrp) : product?.mrp;
        }
        return product?.mrp;
      })()
    : currentMrp;

  return (
    <>
      <div className="card w-full h-full flex flex-col group">
        <Link href={`/product/${product.slug || product._id}`} className="flex-shrink-0">
          <div className="product-img w-full rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 lg:h-72">
            <Image
              src={(() => {
                const images = product.images || [];
                const featuredIndex = product.featuredImageIndex !== undefined ? product.featuredImageIndex : 0;
                return images[featuredIndex] || images[0] || "/img/product.png";
              })()}
              alt={product.name || "Product"}
              height={500}
              width={500}
              className="h-full w-full object-cover"
            ></Image>
          </div>
        </Link>
        <div className="product-info py-4 flex flex-col gap-2 flex-1">
          <Link href={`/product/${product.slug || product._id}`}>
            <h3 className="text-base sm:text-md font-semibold leading-tight h-5 flex line-clamp-1 hover:text-blue-600 transition-colors">
              {product.name || "Unnamed Product"}
            </h3>
          </Link>
          <div className="text-sm sm:text-base flex items-center gap-2">
            {displayMrp && Number(displayMrp) > Number(displayPrice) && (
              <span className="text-gray-400 line-through">₹{displayMrp.toFixed(2)}</span>
            )}
            <span className="text-gray-900 font-semibold">₹{displayPrice.toFixed(2)}</span>
          </div>

          <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
            <Button 
              className="w-full bg-[#174986] hover:bg-[#174986]/90 text-sm sm:text-base cursor-pointer"
              onClick={handleAddToCart}
            >
              {isVariableProduct ? "Select Options" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {isVariableProduct && (
        <Dialog open={isVariantModalOpen} onOpenChange={(open) => {
          setIsVariantModalOpen(open);
          // Reset selections when modal closes
          if (!open) {
            setSelectedVariantOptions({});
            setSelectedVariant(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>
                Select your preferred options
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {variantOptions.map((option) => (
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
                      {option.values.map((value) => {
                        // Check if this value is available
                        const isAvailable = variants.some(v => 
                          v.isActive !== false && 
                          v.stock > 0 && 
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
              ))}

              {selectedVariant && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="flex items-center gap-2">
                      {currentMrp && Number(currentMrp) > Number(currentPrice) && (
                        <span className="text-sm text-gray-400 line-through">₹{currentMrp.toFixed(2)}</span>
                      )}
                      <span className="text-lg font-semibold text-gray-900">₹{currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`text-sm font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentStock > 0 ? `${currentStock} available` : "Out of stock"}
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
                  setIsVariantModalOpen(false);
                  setSelectedVariantOptions({});
                  setSelectedVariant(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCartFromModal}
                disabled={!selectedVariant || currentStock <= 0}
                className="flex-1 bg-[#174986] hover:bg-[#174986]/90"
              >
                Add to Cart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductCard;
