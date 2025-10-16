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
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import {
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ProductSpecificationCard from "@/components/product/ProductSpecificationCard";
import ProductInfoCard from "@/components/product/ProductInfoCard";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAllProductsQuery } from "@/features/products/productApi";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

const page = () => {
  const params = useParams();
  const productId = params.id;
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLessSpecs, setShowLessSpecs] = useState(false);
  const [showLessDescription, setShowLessDescription] = useState(false);

  // API calls
  const { data: productsData, isLoading: productsLoading } = useGetAllProductsQuery();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Find the current product
  const products = productsData?.products || [];
  const product = products.find(p => p._id === productId);
  const relatedProducts = products.filter(p => p._id !== productId && p.category?._id === product?.category?._id).slice(0, 6);

  // Dynamic data from product
  const images = product?.images || ["/img/product.png"];
  const colors = product?.colors || [
    { name: "black", value: "#000000" },
    { name: "blue", value: "#3B82F6" },
    { name: "white", value: "#FFFFFF" },
    { name: "navy", value: "#1E3A8A" },
  ];

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleImageChange = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    await addToWishlist(product);
  };

  // Loading state
  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center text-muted-foreground">Loading product...</div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="text-blue-600 hover:text-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-4">
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
          <div className="flex gap-4">
            {/* Thumbnail Images */}
            <div className="w-24 h-96 md:h-[500px] lg:h-[550px] flex flex-col overflow-y-auto">
              <div
                className={`flex flex-col h-full ${
                  images.length <= 4 ? "justify-between gap-2" : "gap-4"
                }`}
              >
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`${
                      images.length <= 4
                        ? "flex-1 min-h-0"
                        : "h-20 flex-shrink-0"
                    } bg-gray-200 rounded-lg cursor-pointer border-2 ${
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
                      height={images.length <= 4 ? 200 : 80}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Image with Navigation */}
            <div className="flex-1 relative">
              <div className="h-96 md:h-[500px] lg:h-[550px] bg-gray-200 rounded-lg overflow-hidden relative">
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={() => handleImageChange("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleImageChange("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-semibold text-gray-900">
                  ₹{product.price}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{product.rating || 4.5} ratings</span>
                </div>
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Choose your color
              </label>
              <div className="flex gap-3 py-4">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color.name
                        ? "border-gray-800 ring-2 ring-gray-300"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center bg-gray-100 rounded-sm px-4 py-2">
                <span className="text-sm text-black mr-3">Quantity</span>
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="text-gray-600 hover:text-gray-800 px-2"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="mx-3 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="text-gray-600 hover:text-gray-800 px-2"
                >
                  +
                </button>
              </div>

              <Button 
                className="flex-1 bg-[#174986] text-white py-3 rounded-sm"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Add to Cart <ShoppingCart className="ml-2" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center bg-[#E6E6E6] justify-center gap-2 rounded-sm"
                onClick={handleAddToWishlist}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product?._id) ? 'fill-red-500 text-red-500' : ''}`} />
                Wishlist
              </Button>
              <Button
                variant="outline"
                className="flex items-center bg-[#E6E6E6] justify-center gap-2 rounded-sm"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Information & Specifications */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
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

      {/* Product Description */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="bg-white rounded-lg py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <button
              onClick={() => setShowLessDescription(!showLessDescription)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showLessDescription ? "Show more" : "Show less"}
              {showLessDescription ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showLessDescription
                ? "max-h-0 opacity-0"
                : "max-h-[1000px] opacity-100"
            }`}
          >
            <div className="pt-2">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-16 py-10">
        <div className="py-4 flex justify-between items-center">
          <h2 className="text-3xl font-medium">Products you may like</h2>
          <Link
            href="/shop"
            className="flex items-center gap-2 transition-colors duration-300"
          >
            <span className="text-sm md:text-base">Shop all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Products Swiper */}
        <div>
          {relatedProducts.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              slidesPerView={1.2}
              freeMode={true}
              className="products-swiper"
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
                <SwiperSlide key={relatedProduct._id} className="border p-2 rounded-lg">
                  <ProductCard product={relatedProduct} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No related products found
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default page;
