"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import {
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ProductSpecificationCard from "@/components/product/ProductSpecificationCard";
import ProductInfoCard from "@/components/product/ProductInfoCard";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetProductByIdQuery, useGetAllProductsQuery } from "@/features/products/productApi";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

const page = () => {
  const params = useParams();
  // Support both slug and id for backward compatibility
  const productIdentifier = params.id;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLessSpecs, setShowLessSpecs] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Variable product state
  const [selectedVariantOptions, setSelectedVariantOptions] = useState({}); // {Color: "Red", Size: "M"}
  const [selectedVariant, setSelectedVariant] = useState(null);
  const previousVariantIdRef = useRef(null);

  // API calls - use slug-aware query
  const { data: productResponse, isLoading: productsLoading } =
    useGetProductByIdQuery(productIdentifier);
  const { data: allProductsData } = useGetAllProductsQuery();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Get the product from response
  const product = productResponse?.product;
  
  // Get related products from same categories, or any products if no related products found
  const allProducts = allProductsData?.products || [];
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    
    // First, try to find products from same categories
    const categoryRelated = allProducts
      .filter((p) => {
        if (p._id === product._id) return false;
        // Check if products share any category
        const productCategoryIds = (product.categories || []).map(c => c._id || c).map(String);
        const pCategoryIds = (p.categories || []).map(c => c._id || c).map(String);
        return productCategoryIds.some(id => pCategoryIds.includes(id));
      })
      .slice(0, 6);
    
    // If we have related products, return them
    if (categoryRelated.length > 0) {
      return categoryRelated;
    }
    
    // Otherwise, return any products (excluding current product)
    return allProducts
      .filter((p) => p._id !== product._id)
      .slice(0, 6);
  }, [allProducts, product]);

  // Set dynamic page title
  useEffect(() => {
    if (product) {
      document.title = `Besiks - ${product.name}`;
    } else {
      document.title = "Besiks - Product";
    }
  }, [product]);

  // Determine product type
  const productType = product?.productType || "simple";
  const isVariableProduct = productType === "variable";
  
  // Dynamic data from product
  const images = product?.images || ["/img/product.png"];
  const colors = product?.colors ?? [];
  const sizes = product?.sizes ?? [];
  const variantOptions = product?.variantOptions || [];
  const variants = product?.variants || [];
  
  // For simple products, use legacy color/size system
  const hasVariants = !isVariableProduct && ((colors?.length || 0) > 0 || (sizes?.length || 0) > 0);
  
  // Find matching variant based on selected options
  useEffect(() => {
    if (isVariableProduct && variantOptions.length > 0 && variants.length > 0) {
      // Only initialize if no options are selected yet
      if (Object.keys(selectedVariantOptions).length === 0) {
        // Find first available variant (active and in stock)
        const availableVariant = variants.find(v => 
          v.isActive !== false && 
          v.stock > 0 && 
          v.options
        );
        
        if (availableVariant) {
          // Use the options from the first available variant
          setSelectedVariantOptions(availableVariant.options);
        } else {
          // If no available variant, try to find any active variant (even if out of stock)
          const activeVariant = variants.find(v => 
            v.isActive !== false && 
            v.options
          );
          
          if (activeVariant) {
            setSelectedVariantOptions(activeVariant.options);
          } else {
            // Fallback: use first value of each attribute if no variants are available
            const initialOptions = {};
            variantOptions.forEach(option => {
              if (option.values && option.values.length > 0) {
                initialOptions[option.name] = option.values[0];
              }
            });
            if (Object.keys(initialOptions).length > 0) {
              setSelectedVariantOptions(initialOptions);
            }
          }
        }
      }
    }
  }, [product, isVariableProduct, variantOptions, variants]);
  
  // Update selected variant when options change
  useEffect(() => {
    if (isVariableProduct && variants.length > 0) {
      // Check if all required attributes are selected
      const allSelected = variantOptions.every(option => 
        selectedVariantOptions[option.name]
      );
      
      if (allSelected) {
        // Find matching variant
        const matchingVariant = variants.find(variant => {
          if (!variant.options) return false;
          return variantOptions.every(option => {
            return variant.options[option.name] === selectedVariantOptions[option.name];
          });
        });
        
        // Check if variant is changing
        const newVariantId = matchingVariant?._id?.toString();
        const previousVariantId = previousVariantIdRef.current;
        const variantChanged = previousVariantId && newVariantId && previousVariantId !== newVariantId;
        const isFirstVariantSelection = !previousVariantId && newVariantId;
        
        setSelectedVariant(matchingVariant || null);
        
        // If variant changed (or first time selecting) and new variant has less stock than current quantity, adjust quantity
        if ((variantChanged || isFirstVariantSelection) && matchingVariant && quantity > matchingVariant.stock) {
          setQuantity(matchingVariant.stock);
          
        }
        
        // Update the ref with the new variant ID
        if (newVariantId) {
          previousVariantIdRef.current = newVariantId;
        }
        
        // Reset image index when variant changes
        setCurrentImageIndex(0);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedVariantOptions, variants, variantOptions, isVariableProduct, quantity]);
  
  // Get current price, stock, and images based on product type
  const currentPrice = isVariableProduct && selectedVariant 
    ? selectedVariant.price 
    : product?.price || 0;
  const currentMrp = isVariableProduct && selectedVariant 
    ? selectedVariant.mrp 
    : product?.mrp;
  const currentStock = isVariableProduct && selectedVariant 
    ? selectedVariant.stock 
    : product?.stock || 0;
  
  // Get current images - prioritize variant images if available, and featured image first
  const currentImages = useMemo(() => {
    if (isVariableProduct && selectedVariant) {
      // Handle backward compatibility: convert old 'image' to 'images' array
      let variantImages = selectedVariant.images || [];
      if (selectedVariant.image && !selectedVariant.images) {
        variantImages = [selectedVariant.image];
      }
      if (!Array.isArray(variantImages)) {
        variantImages = variantImages ? [variantImages] : [];
      }
      
      // If variant has images, use them; otherwise use product images
      if (variantImages.length > 0) {
        // Get variant featured image index
        const variantFeaturedIndex = selectedVariant.featuredImageIndex !== undefined ? selectedVariant.featuredImageIndex : 0;
        // Reorder to put featured image first
        const featuredImage = variantImages[variantFeaturedIndex];
        const otherVariantImages = variantImages.filter((_, idx) => idx !== variantFeaturedIndex);
        const reorderedVariantImages = featuredImage ? [featuredImage, ...otherVariantImages] : variantImages;
        
        // Combine variant images with product images that aren't in variant images
        const variantImageSet = new Set(reorderedVariantImages);
        const additionalProductImages = images.filter(img => !variantImageSet.has(img));
        return [...reorderedVariantImages, ...additionalProductImages];
      }
    }
    
    // For simple products or when no variant images, prioritize product featured image
    if (images.length > 0) {
      const productFeaturedIndex = product?.featuredImageIndex !== undefined ? product.featuredImageIndex : 0;
      const featuredImage = images[productFeaturedIndex];
      const otherImages = images.filter((_, idx) => idx !== productFeaturedIndex);
      return featuredImage ? [featuredImage, ...otherImages] : images;
    }
    
    return images;
  }, [isVariableProduct, selectedVariant, images, product]);

  // Get available stock - for variable products, use variant stock; for simple products, use product stock
  const availableStock = useMemo(() => {
    return isVariableProduct && selectedVariant 
      ? selectedVariant.stock 
      : product?.stock || 0;
  }, [isVariableProduct, selectedVariant, product]);

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      // Don't allow quantity to exceed available stock
      if (quantity < availableStock) {
        setQuantity((prev) => prev + 1);
      } else {
        toast.error(`Only ${availableStock} items available in stock`);
      }
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleImageChange = (direction) => {
    const imageArray = currentImages.length > 0 ? currentImages : images;
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + imageArray.length) % imageArray.length
      );
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // For variable products, check if variant is selected
    if (isVariableProduct) {
      if (!selectedVariant) {
        return;
      }
      
      const productWithVariant = {
        ...product,
        selectedVariant: selectedVariant,
        selectedVariantOptions: selectedVariantOptions,
        // Override price and stock with variant values
        price: selectedVariant.price,
        stock: selectedVariant.stock,
        sku: selectedVariant.sku || product.sku,
      };
      await addToCart(productWithVariant, quantity);
    } else {
      await addToCart(product, quantity);
    }
  };
  
  const handleVariantOptionChange = (attributeName, value) => {
    // Check if this is a color option (first option or option name contains "color")
    const colorOption = variantOptions.find(opt => 
      variantOptions.indexOf(opt) === 0 || opt.name.toLowerCase().includes("color")
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
        variantOptions.forEach(option => {
          if (option.name !== attributeName && prev[option.name]) {
            // Check if the currently selected value is available with the new color
            const isAvailable = variants.some(v => 
              v.isActive !== false && 
              v.stock > 0 && 
              v.options[option.name] === prev[option.name] &&
              v.options[attributeName] === value
            );
            
            if (!isAvailable) {
              // Find first available value for this option with the new color
              const availableValue = option.values.find(val => {
                return variants.some(v => 
                  v.isActive !== false && 
                  v.stock > 0 && 
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

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    // For variable products, ensure variant is selected
    if (isVariableProduct && !selectedVariant) {
      return;
    }
    
    // Prepare product with variant information
    const productToAdd = isVariableProduct && selectedVariant
      ? {
          ...product,
          selectedVariant: selectedVariant,
          selectedVariantOptions: selectedVariantOptions,
          price: selectedVariant.price,
          stock: selectedVariant.stock,
          sku: selectedVariant.sku || product.sku,
        }
      : product;
    
    // Check if product (with variant) is already in wishlist
    const variantId = selectedVariant?._id?.toString();
    const variantSku = selectedVariant?.sku;
    const variantOptions = selectedVariantOptions;
    
    const alreadyInWishlist = isInWishlist(product._id, variantId, variantSku, variantOptions);
    
    if (alreadyInWishlist) {
      // Remove from wishlist
      await removeFromWishlist(product._id, variantId, variantSku, variantOptions);
    } else {
      // Add to wishlist
      await addToWishlist(productToAdd);
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const productName = product?.name || "Check out this product";
    
    // Use native share if available (works on both mobile and desktop)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out this product: ${productName}`,
          url: currentUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          // Fallback to clipboard if native share fails
          try {
            await navigator.clipboard.writeText(currentUrl);
            toast.success("URL copied successfully!");
          } catch (clipboardError) {
            toast.error("Failed to share. Please try again.");
          }
        }
      }
    } else {
      // Fallback to clipboard if native share is not available
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("URL copied successfully!");
      } catch (error) {
        console.error("Failed to copy URL:", error);
        toast.error("Failed to copy URL. Please try again.");
      }
    }
  };

  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  // Ref for Products you may like swiper
  const relatedProductsSwiperRef = useRef(null);
  const [isBeginningRelated, setIsBeginningRelated] = useState(true);
  const [isEndRelated, setIsEndRelated] = useState(false);

  // Loading state
  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center text-muted-foreground">
          Loading product...
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link href="/shop" className="text-blue-600 hover:text-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">
          {/* Left side - Product Images */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Image with Navigation */}
            <div className="flex-1 relative order-1 lg:order-2">
              <div className="h-96 md:h-[500px] lg:h-[550px] bg-gray-200 rounded-lg overflow-hidden relative">
                <Image
                  src={currentImages[currentImageIndex] || images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* Navigation Arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageChange("prev")}
                      disabled={currentImageIndex === 0}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md transition-shadow ${
                        currentImageIndex === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleImageChange("next")}
                      disabled={currentImageIndex === currentImages.length - 1}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md transition-shadow ${
                        currentImageIndex === currentImages.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg cursor-pointer"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="w-full lg:w-24 h-auto lg:h-[550px] flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto gap-2 order-2 lg:order-1">
              {currentImages.map((img, index) => (
                <div
                  key={index}
                  className={`bg-gray-200 w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-lg cursor-pointer border-2 ${
                    currentImageIndex === index
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300"
                  } transition-colors`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={img}
                    alt={`Product image ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {currentMrp && Number(currentMrp) > Number(currentPrice) && (
                  <span className="text-lg text-gray-400 line-through">₹{currentMrp}</span>
                )}
                <span className="text-2xl font-semibold text-gray-900">₹{currentPrice}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  {product.rating || 4.5} ratings
                </span>
              </div>
            </div>

            {/* Variant Selectors */}
            {isVariableProduct ? (
              <div className="space-y-4">
                {variantOptions.map((option, optionIndex) => {
                  // Determine if this is a color option (first option or option name contains "color")
                  const isColorOption = optionIndex === 0 || option.name.toLowerCase().includes("color");
                  
                  return (
                    <div key={option.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {option.name} {selectedVariantOptions[option.name] && `(${selectedVariantOptions[option.name]})`}
                      </label>
                      <div className="flex flex-wrap gap-3 py-2">
                        {option.values.map((value) => {
                          const isSelected = selectedVariantOptions[option.name] === value;
                          
                          // Colors are always available (clickable)
                          // Sizes are only available if they exist in the selected color
                          let isAvailable;
                          if (isColorOption) {
                            // Color options are always clickable
                            isAvailable = variants.some(v => 
                              v.isActive !== false && 
                              v.options[option.name] === value
                            );
                          } else {
                            // For size options, check if available in selected color
                            // Get the selected color (first option or option with "color" in name)
                            const colorOption = variantOptions.find(opt => 
                              variantOptions.indexOf(opt) === 0 || opt.name.toLowerCase().includes("color")
                            );
                            const selectedColor = colorOption ? selectedVariantOptions[colorOption.name] : null;
                            
                            if (selectedColor) {
                              // Check if this size is available in the selected color
                              isAvailable = variants.some(v => 
                                v.isActive !== false && 
                                v.stock > 0 && 
                                v.options[option.name] === value &&
                                v.options[colorOption.name] === selectedColor
                              );
                            } else {
                              // If no color selected, check if this size exists in any color
                              isAvailable = variants.some(v => 
                                v.isActive !== false && 
                                v.stock > 0 && 
                                v.options[option.name] === value
                              );
                            }
                          }
                          
                          return (
                            <button
                              key={value}
                              onClick={() => handleVariantOptionChange(option.name, value)}
                              disabled={!isAvailable}
                              className={`min-w-10 px-3 h-8 rounded-sm border-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "border-gray-800 text-gray-900 bg-gray-100"
                                  : isAvailable
                                  ? "border-gray-300 text-gray-700 hover:border-gray-400 cursor-pointer"
                                  : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!selectedVariant && Object.keys(selectedVariantOptions).length > 0 && (
                  <p className="text-sm text-red-500">
                    Please select all options to see availability
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Color Selector */}
                {colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Choose your color
                    </label>
                    <div className="flex gap-3 py-2">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-8 h-8 rounded-md border-2 cursor-pointer ${
                            selectedColor === color.name
                              ? "ring-2"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Choose your size
                    </label>
                    <div className="flex flex-wrap gap-3 py-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          aria-pressed={selectedSize === size}
                          className={`min-w-10 px-3 h-8 rounded-sm border-2 text-sm font-medium cursor-pointer transition-colors ${
                            selectedSize === size
                              ? "border-gray-800 text-gray-900"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Shipping/Returns will render below Product details when no variants */}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentStock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm ${
                  currentStock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentStock > 0 
                  ? `In stock (${currentStock} available)` 
                  : isVariableProduct && !selectedVariant
                  ? "Select options to see availability"
                  : "Out of stock"}
              </span>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center bg-gray-100 rounded-sm px-4 h-12">
                <span className="text-sm text-black mr-3">Quantity</span>
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className={`px-2 ${quantity <= 1 ? "text-gray-400 cursor-not-allowed opacity-50" : "text-gray-600 hover:text-gray-800 cursor-pointer"}`}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="mx-3 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity >= availableStock}
                  className={`px-2 ${
                    quantity >= availableStock
                      ? "text-gray-400 cursor-not-allowed opacity-50" 
                      : "text-gray-600 hover:text-gray-800 cursor-pointer"
                  }`}
                >
                  +
                </button>
              </div>

              <Button
                className="flex-1 bg-[#174986] hover:bg-[#174986]/90 text-white h-12 rounded-sm cursor-pointer"
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || (isVariableProduct && !selectedVariant)}
              >
                Add to Cart <ShoppingCart className="ml-2" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center bg-[#E6E6E6] justify-center gap-2 rounded-sm cursor-pointer h-12"
                onClick={handleAddToWishlist}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(
                      product?._id,
                      selectedVariant?._id?.toString(),
                      selectedVariant?.sku,
                      selectedVariantOptions
                    )
                      ? "fill-red-500 text-red-500"
                      : ""
                  }`}
                />
                Wishlist
              </Button>
              <Button
                variant="outline"
                className="flex items-center bg-[#E6E6E6] justify-center gap-2 rounded-sm cursor-pointer h-12"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* Product Details + Conditional Shipping/Returns grouped to tighten spacing */}
            <div className="space-y-2">
              <Collapsible
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                className="border rounded-sm"
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium">
                  <span>Product details</span>
                  {detailsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 text-sm text-gray-700">
                  <p className="leading-relaxed">
                    {product.description ||
                      "No additional details available for this product."}
                  </p>
                </CollapsibleContent>
              </Collapsible>
              {!hasVariants && (
                <div className="space-y-2">
                  <Collapsible
                    open={shippingOpen}
                    onOpenChange={setShippingOpen}
                    className="border rounded-sm"
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium">
                      <span>Shipping</span>
                      {shippingOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 text-sm text-gray-700">
                      <p className="leading-relaxed">
                        Orders ship within 1-2 business days. Standard delivery arrives in 3-6 business days depending on your location.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={returnsOpen}
                    onOpenChange={setReturnsOpen}
                    className="border rounded-sm"
                  >
                    <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium">
                      <span>Returns</span>
                      {returnsOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 text-sm text-gray-700">
                      <p className="leading-relaxed">
                        Hassle-free returns within 30 days of delivery. Items must be unused and in original packaging.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* Product Information & Specifications */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-8 md:py-8">
        <div className="bg-white rounded-lg py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Product information & specifications
            </h2>
            <button
              onClick={() => setShowLessSpecs(!showLessSpecs)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showLessSpecs ? "Show more" : "Show less"}
              {showLessSpecs ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showLessSpecs ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              {/* Left Column - Product Features */}
              <div className="space-y-4">
                <ProductInfoCard info="With the Intel Core i7 processor and 16 gigabytes of RAM, you can edit photos and videos and multitask between heavy programs." />

                <ProductInfoCard info="With 1 terabyte you have enough storage space for all your photos, videos and other files." />

                <ProductInfoCard info="With HP Fast Charge, you can recharge your laptop up to 50 percent in about 45 minutes, so you can quickly continue wirelessly." />

                <ProductInfoCard info="This laptop weighs only 1.4 kilograms, making it easier to carry than other laptops." />

                <ProductInfoCard info="This laptop's WQXGA display is almost twice as sharp as a full HD screen, allowing you to see more details." />

                <ProductInfoCard info="This laptop cannot be expanded with extra storage or RAM, making it less future-proof." />

                <ProductInfoCard info="We recommend at least 512 gigabytes of storage if you keep a lot of photos and programs." />

                <ProductInfoCard info="Choose a model with at least 10 graphics cores for faster photo and video editing." />
              </div>

              {/* Right Column - Specifications Table */}
              <div className="space-y-0">
                <ProductSpecificationCard
                  label="Display"
                  value="15.6-inch Full HD (1920 x 1080)"
                  isOdd={true}
                />
                <ProductSpecificationCard
                  label="Processor"
                  value="Intel Core i7 (13th Gen)"
                  isOdd={false}
                />
                <ProductSpecificationCard
                  label="Internal working memory (RAM)"
                  value="16 GB"
                  isOdd={true}
                />
                <ProductSpecificationCard
                  label="Total storage capacity"
                  value="512 GB"
                  isOdd={false}
                />
                <ProductSpecificationCard
                  label="Video card chipset"
                  value="AMD Radeon Graphics"
                  isOdd={true}
                />
                <ProductSpecificationCard
                  label="Recommended for use with laptops"
                  value="Photo Editing, Music Production & DJing, On the Go, Spreadsheets & Presentations, Study, Video Editing"
                  isOdd={false}
                />
                <ProductSpecificationCard
                  label="Connectivity"
                  value="Wi-Fi 6, Bluetooth 5.1, USB-C"
                  isOdd={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 pt-0 pb-10 md:py-10">
        <div className="py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-medium">Products you may like</h2>
          
          {/* Navigation Arrows */}
          {relatedProducts.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => relatedProductsSwiperRef.current?.slidePrev()}
                disabled={isBeginningRelated}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isBeginningRelated
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className={`w-5 h-5 ${isBeginningRelated ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
              <button
                onClick={() => relatedProductsSwiperRef.current?.slideNext()}
                disabled={isEndRelated}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isEndRelated
                    ? "border-gray-300 cursor-not-allowed opacity-50"
                    : "border-[#174986] hover:bg-[#174986]/10"
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className={`w-5 h-5 ${isEndRelated ? "text-gray-300" : "text-[#174986]"}`} />
              </button>
            </div>
          )}
        </div>

        {/* Related Products Swiper */}
        <div>
          {relatedProducts.length > 0 ? (
            <Swiper
              modules={[FreeMode, Navigation]}
              spaceBetween={16}
              slidesPerView={2}
              freeMode={true}
              className="products-swiper"
              onSwiper={(swiper) => {
                relatedProductsSwiperRef.current = swiper;
                setIsBeginningRelated(swiper.isBeginning);
                setIsEndRelated(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginningRelated(swiper.isBeginning);
                setIsEndRelated(swiper.isEnd);
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1.5,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3.5,
                  spaceBetween: 28,
                },
                1280: {
                  slidesPerView: 4.5,
                  spaceBetween: 32,
                },
              }}
            >
              {relatedProducts.map((relatedProduct) => (
                <SwiperSlide
                  key={relatedProduct._id}
                  className="border p-2 rounded-lg"
                >
                  <ProductCard product={relatedProduct} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No products available
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default page;
