"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ShoppingCart, X, Plus, Minus, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useGetProductByIdQuery } from "@/features/products/productApi";
import { toast } from "sonner";

const CartSheet = ({ isOpen, onOpenChange, cartCount = 0 }) => {
  const { cart, cartCount: actualCartCount, isLoading, isError, updateCartItem, removeFromCart, addToCart, isAuthenticated } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [editingVariantItem, setEditingVariantItem] = useState(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const router = useRouter();
  
  // Fetch full product data when editing variant
  const { data: fullProductData } = useGetProductByIdQuery(
    editingVariantItem?.product?._id || editingVariantItem?.product?.slug,
    { skip: !editingVariantItem || !editingVariantItem.product?._id }
  );
  
  // Use full product data if available, otherwise use cart item product
  const productForVariantDialog = fullProductData?.product || editingVariantItem?.product;

  // Prevent hydration mismatch by only rendering cart count on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter out items where product is null or doesn't exist (deleted products)
  const cartItems = (cart.items || []).filter(item => {
    // For authenticated users, check if product exists
    if (isAuthenticated) {
      return item.product !== null && item.product !== undefined;
    }
    // For guest cart, product should always exist in the item object
    return item.product && item.product._id;
  });
  const totalItems = actualCartCount;
  const totalPrice = cart.totalPrice || 0;

  // Helper function to get available stock for an item
  const getAvailableStock = (item) => {
    if (!item?.product) return 0;
    
    // For variable products, get stock from variant
    if (item.product.productType === "variable" && item.variantOptions && item.product.variants) {
      const variant = item.product.variants.find(v => {
        if (!v.options) return false;
        const itemOptions = item.variantOptions;
        return Object.keys(itemOptions).every(
          key => v.options[key] === itemOptions[key]
        ) && Object.keys(v.options).length === Object.keys(itemOptions).length;
      });
      if (variant) {
        return Number(variant.stock) || 0;
      }
    }
    
    // For simple products, get stock from product
    return Number(item.product.stock) || 0;
  };

  const updateQuantity = async (productId, newQuantity, variantSku, variantOptions, item) => {
    // Get available stock using the helper function
    const availableStock = getAvailableStock(item);
    
    // Prevent quantity from exceeding available stock
    if (availableStock > 0 && newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }
    
    await updateCartItem(productId, newQuantity, variantSku, variantOptions);
  };

  const removeItem = async (productId, variantSku, variantOptions, variantId) => {
    await removeFromCart(productId, variantSku, variantOptions, variantId);
  };

  const handleEditVariant = (item) => {
    if (item.product?.productType === "variable") {
      // Initialize with current variant options
      const currentOptions = item.variantOptions || {};
      setSelectedVariantOptions(currentOptions);
      setEditingVariantItem(item);
      
      // Find current variant
      if (item.product.variants) {
        const currentVariant = item.product.variants.find(v => {
          if (!v.options) return false;
          return Object.keys(currentOptions).every(
            key => v.options[key] === currentOptions[key]
          ) && Object.keys(v.options).length === Object.keys(currentOptions).length;
        });
        setSelectedVariant(currentVariant || null);
      }
    }
  };

  // Find matching variant when options change
  useEffect(() => {
    const product = productForVariantDialog;
    if (product?.variants?.length > 0) {
      // Derive variant options from variants if variantOptions array is not available or empty
      let variantOptionsArray = product?.variantOptions;
      
      // Check if variantOptions exists and has items, otherwise derive from variants
      if ((!variantOptionsArray || variantOptionsArray.length === 0) && product?.variants?.length > 0) {
        // Build variant options from variants
        const optionMap = {};
        product.variants.forEach(variant => {
          // Check if variant has options (could be an object or undefined)
          if (variant && variant.options && typeof variant.options === 'object' && variant.isActive !== false) {
            const variantOptions = variant.options;
            Object.keys(variantOptions).forEach(optionName => {
              if (variantOptions[optionName]) {
                if (!optionMap[optionName]) {
                  optionMap[optionName] = new Set();
                }
                optionMap[optionName].add(variantOptions[optionName]);
              }
            });
          }
        });
        
        // Convert to array format
        if (Object.keys(optionMap).length > 0) {
          variantOptionsArray = Object.keys(optionMap).map(optionName => ({
            name: optionName,
            values: Array.from(optionMap[optionName])
          }));
        }
      }
      
      if (variantOptionsArray && variantOptionsArray.length > 0) {
        const allSelected = variantOptionsArray.every(option => 
          selectedVariantOptions[option.name]
        );
        
        if (allSelected) {
          const matchingVariant = product.variants.find(variant => {
            if (!variant.options) return false;
            return variantOptionsArray.every(option => {
              return variant.options[option.name] === selectedVariantOptions[option.name];
            });
          });
          setSelectedVariant(matchingVariant || null);
        } else {
          setSelectedVariant(null);
        }
      }
    }
  }, [selectedVariantOptions, editingVariantItem, productForVariantDialog]);

  const handleVariantOptionChange = (attributeName, value) => {
    // Get variantOptions from product
    const product = productForVariantDialog || editingVariantItem?.product;
    const variants = product?.variants || [];
    let variantOptionsArray = product?.variantOptions || [];
    
    // Derive variant options from variants if variantOptions array is not available
    if ((!variantOptionsArray || variantOptionsArray.length === 0) && variants.length > 0) {
      const optionMap = {};
      variants.forEach(variant => {
        if (variant && variant.options && typeof variant.options === 'object' && variant.isActive !== false) {
          Object.keys(variant.options).forEach(optionName => {
            if (variant.options[optionName]) {
              if (!optionMap[optionName]) {
                optionMap[optionName] = new Set();
              }
              optionMap[optionName].add(variant.options[optionName]);
            }
          });
        }
      });
      if (Object.keys(optionMap).length > 0) {
        variantOptionsArray = Object.keys(optionMap).map(optionName => ({
          name: optionName,
          values: Array.from(optionMap[optionName])
        }));
      }
    }
    
    // Check if this is a color option (first option or option name contains "color")
    const colorOption = variantOptionsArray.find(opt => 
      variantOptionsArray.indexOf(opt) === 0 || opt.name.toLowerCase().includes("color")
    );
    const isColorOption = colorOption && colorOption.name === attributeName;
    
    if (isColorOption) {
      // When color changes, check other selected options and adjust them if needed
      setSelectedVariantOptions(prev => {
        const newOptions = {
          ...prev,
          [attributeName]: value // Update the color
        };
        
        // Check each other option and adjust if not available with new color
        variantOptionsArray.forEach(option => {
          if (option.name !== attributeName && prev[option.name]) {
            // Check if the currently selected value is available with the new color
            const isAvailable = variants.some(v => 
              v.isActive !== false && 
              v.stock > 0 && 
              v.options && 
              v.options[option.name] === prev[option.name] &&
              v.options[attributeName] === value
            );
            
            if (!isAvailable) {
              // Find first available value for this option with the new color
              const availableValue = option.values.find(val => {
                return variants.some(v => 
                  v.isActive !== false && 
                  v.stock > 0 && 
                  v.options && 
                  v.options[option.name] === val &&
                  v.options[attributeName] === value
                );
              });
              
              if (availableValue) {
                newOptions[option.name] = availableValue;
              } else {
                // If no available value, remove this option
                delete newOptions[option.name];
              }
            }
          }
        });
        
        return newOptions;
      });
    } else {
      // For non-color options, just update that option
      setSelectedVariantOptions(prev => ({
        ...prev,
        [attributeName]: value
      }));
    }
  };

  const handleUpdateVariant = async () => {
    if (!selectedVariant || !editingVariantItem) {
      toast.error("Please select all options");
      return;
    }

    // Remove old item and add new one with updated variant
    const product = productForVariantDialog || editingVariantItem.product;
    if (!product?._id) {
      toast.error("Product information is missing");
      return;
    }
    
    await removeItem(editingVariantItem.product._id, editingVariantItem.variantSku, editingVariantItem.variantOptions, editingVariantItem.variantId);
    
    const productWithVariant = {
      ...product,
      selectedVariant: selectedVariant,
      selectedVariantOptions: selectedVariantOptions,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      sku: selectedVariant.sku || product?.sku,
    };
    
    // Add with new variant
    await addToCart(productWithVariant, editingVariantItem.quantity);
    
    setEditingVariantItem(null);
    setSelectedVariantOptions({});
    setSelectedVariant(null);
    toast.success("Variant updated successfully");
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed with checkout");
      const returnUrl = encodeURIComponent("/checkout");
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      onOpenChange(false);
      return;
    }
    router.push("/checkout");
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-blue-600 relative cursor-pointer"
        >
          <ShoppingCart strokeWidth={2} className="!h-5 !w-5" />
          {isClient && totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
            >
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Shopping cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[80vw] sm:w-[400px] md:w-[450px] flex flex-col"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-semibold">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground">Loading cart...</div>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-red-500">Error loading cart</div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="px-4 flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart strokeWidth={2} className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Link href="/shop"> 
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-4">
              {cartItems
                .filter((item) => item.product) // Filter out items with null products
                .map((item) => {
                const productUrl = `/product/${item.product?.slug || item.product?._id || '#'}`;
                // Create unique key for variants
                const itemKey = item.variantId 
                  ? `${item.product?._id}_${item.variantId}`
                  : item.variantSku 
                    ? `${item.product?._id}_${item.variantSku}`
                    : item.variantOptions
                      ? `${item.product?._id}_${JSON.stringify(item.variantOptions)}`
                      : item.product?._id;
                return (
                <div
                  key={itemKey}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg"
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
                        if (item.selectedVariant?.images?.length > 0) {
                          const variantImages = item.selectedVariant.images;
                          const variantFeaturedIndex = item.selectedVariant.featuredImageIndex !== undefined ? item.selectedVariant.featuredImageIndex : 0;
                          return variantImages[variantFeaturedIndex] || variantImages[0] || "/placeholder.jpg";
                        }
                        // Otherwise use product featured image
                        const productImages = item.product?.images || [];
                        const productFeaturedIndex = item.product?.featuredImageIndex !== undefined ? item.product.featuredImageIndex : 0;
                        return productImages[productFeaturedIndex] || productImages[0] || item.image || "/placeholder.jpg";
                      })()}
                      alt={item.product?.name || "Product"}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link 
                          href={productUrl}
                          onClick={() => onOpenChange(false)}
                          className="block"
                        >
                          <h4 className="font-medium text-gray-900 text-sm leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                            {item.product?.name || item.name || "Product"}
                          </h4>
                        </Link>
                        {item.product?.categories?.[0]?.name && (
                          <p className="text-sm text-gray-500">
                            {item.product.categories[0].name}
                          </p>
                        )}
                        {/* Show selected variant information */}
                        {item.product?.productType === "variable" && item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                          <div className="mt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {Object.entries(item.variantOptions).map(([key, value]) => (
                                <span key={key} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVariant(item);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Change variant
                            </button>
                          </div>
                        )}
                        {/* Debug: Show if product is variable but no variantOptions */}
                        {item.product?.productType === "variable" && (!item.variantOptions || Object.keys(item.variantOptions).length === 0) && (
                          <div className="mt-1 text-xs text-amber-600">
                            Variable product - variant info missing
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.product?._id) {
                            removeItem(item.product._id, item.variantSku, item.variantOptions, item.variantId);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <span className="text-xs">Remove</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div 
                        className="flex items-center gap-3 border rounded-md border-[#174986]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.product?._id) {
                              updateQuantity(
                                item.product._id,
                                Math.max(1, item.quantity - 1),
                                item.variantSku,
                                item.variantOptions,
                                item
                              );
                            }
                          }}
                          disabled={item.quantity <= 1 || !item.product?._id}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            item.quantity <= 1 || !item.product?._id
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'text-white cursor-pointer'
                          }`}
                        >
                          <Minus className="h-3 w-3" color="#174986"/>
                        </button>
                        <span className="font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.product?._id) {
                              updateQuantity(
                                item.product._id, 
                                item.quantity + 1,
                                item.variantSku,
                                item.variantOptions,
                                item
                              );
                            }
                          }}
                          disabled={!item.product?._id || item.quantity >= getAvailableStock(item)}
                          className="w-8 cursor-pointer h-8 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3 w-3" color="#174986"/>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="border-t py-4 space-y-4 px-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">
                  Subtotal ({totalItems} items)
                </span>
                <span className="text-lg font-semibold">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <Button className="w-full cursor-pointer bg-[#174986] hover:bg-[#174986]/90 text-white" size="lg" onClick={handleCheckoutClick}>
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>

      {/* Variant Selection Modal */}
      {editingVariantItem && editingVariantItem.product?.productType === "variable" && (
        <Dialog 
          open={!!editingVariantItem} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingVariantItem(null);
              setSelectedVariantOptions({});
              setSelectedVariant(null);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Variant - {productForVariantDialog?.name || editingVariantItem?.product?.name || "Product"}</DialogTitle>
              <DialogDescription>
                Select your preferred options
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {(() => {
                const product = productForVariantDialog;
                
                if (!product) {
                  return (
                    <div className="text-sm text-gray-500 py-4">
                      Loading product information...
                    </div>
                  );
                }
                
                // Derive variant options from variants if variantOptions array is not available or empty
                let variantOptionsArray = product?.variantOptions;
                
                // Check if variantOptions exists and has items, otherwise derive from variants
                if ((!variantOptionsArray || variantOptionsArray.length === 0) && product?.variants?.length > 0) {
                  // Build variant options from variants
                  const optionMap = {};
                  product.variants.forEach(variant => {
                    // Check if variant has options (could be an object or undefined)
                    if (variant && variant.options && typeof variant.options === 'object' && variant.isActive !== false) {
                      const variantOptions = variant.options;
                      Object.keys(variantOptions).forEach(optionName => {
                        if (variantOptions[optionName]) {
                          if (!optionMap[optionName]) {
                            optionMap[optionName] = new Set();
                          }
                          optionMap[optionName].add(variantOptions[optionName]);
                        }
                      });
                    }
                  });
                  
                  // Convert to array format
                  if (Object.keys(optionMap).length > 0) {
                    variantOptionsArray = Object.keys(optionMap).map(optionName => ({
                      name: optionName,
                      values: Array.from(optionMap[optionName])
                    }));
                  }
                }
                
                if (!variantOptionsArray || variantOptionsArray.length === 0) {
                  // Debug: Log the product structure to help identify the issue
                  console.log('Variant options not found. Product structure:', {
                    hasProduct: !!product,
                    hasVariants: !!product?.variants,
                    variantsLength: product?.variants?.length,
                    variantOptions: product?.variantOptions,
                    firstVariant: product?.variants?.[0],
                    productId: product?._id
                  });
                  
                  return (
                    <div className="text-sm text-gray-500 py-4">
                      No variant options available for this product.
                    </div>
                  );
                }
                
                return variantOptionsArray.map((option, optionIndex) => {
                  // Determine if this is a color option (first option or option name contains "color")
                  const isColorOption = optionIndex === 0 || option.name.toLowerCase().includes("color");
                  
                  return (
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
                            // Colors are always available (clickable)
                            // Sizes are only available if they exist in the selected color
                            let isAvailable;
                            if (isColorOption) {
                              // Color options are always clickable
                              isAvailable = product?.variants?.some(v => 
                                v.isActive !== false && 
                                v.options && 
                                v.options[option.name] === value
                              );
                            } else {
                              // For size options, check if available in selected color
                              // Get the selected color (first option or option with "color" in name)
                              const colorOption = variantOptionsArray.find(opt => 
                                variantOptionsArray.indexOf(opt) === 0 || opt.name.toLowerCase().includes("color")
                              );
                              const selectedColor = colorOption ? selectedVariantOptions[colorOption.name] : null;
                              
                              if (selectedColor) {
                                // Check if this size is available in the selected color
                                isAvailable = product?.variants?.some(v => 
                                  v.isActive !== false && 
                                  v.stock > 0 && 
                                  v.options &&
                                  v.options[option.name] === value &&
                                  v.options[colorOption.name] === selectedColor
                                );
                              } else {
                                // If no color selected, check if this size exists in any color
                                isAvailable = product?.variants?.some(v => 
                                  v.isActive !== false && 
                                  v.stock > 0 && 
                                  v.options &&
                                  v.options[option.name] === value
                                );
                              }
                            }
                            
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
                  );
                });
              })()}

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
                  setEditingVariantItem(null);
                  setSelectedVariantOptions({});
                  setSelectedVariant(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateVariant}
                disabled={!selectedVariant || (selectedVariant && selectedVariant.stock <= 0)}
                className="flex-1 bg-[#174986] hover:bg-[#174986]/90"
              >
                Update Variant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
};

export default CartSheet;
