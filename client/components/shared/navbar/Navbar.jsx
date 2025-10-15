"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Heart, User, ChevronDown } from "lucide-react";
import CartSheet from "@/components/shared/cart/CartSheet";
import SearchResults from "@/components/shared/search/SearchResults";
import { useGetWishlistCountQuery } from "@/features/wishlist/wishlistApi";
import { useGetCartCountQuery } from "@/features/cart/cartApi";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop", hasMegaMenu: true },
  { name: "Hairdryer", href: "#" },
  { name: "Trimmer", href: "#" },
  { name: "About Us", href: "/about" },
];

const megaMenuCategories = [
  {
    title: "Clothing",
    items: [
      { name: "T-Shirts", href: "/shop/clothing/t-shirts" },
      { name: "Jeans", href: "/shop/clothing/jeans" },
      { name: "Dresses", href: "/shop/clothing/dresses" },
      { name: "Jackets", href: "/shop/clothing/jackets" },
      { name: "Sweaters", href: "/shop/clothing/sweaters" },
    ],
  },
  {
    title: "Electronics",
    items: [
      { name: "Smartphones", href: "/shop/electronics/smartphones" },
      { name: "Laptops", href: "/shop/electronics/laptops" },
      { name: "Headphones", href: "/shop/electronics/headphones" },
      { name: "Smart Watches", href: "/shop/electronics/smartwatches" },
      { name: "Cameras", href: "/shop/electronics/cameras" },
    ],
  },
  {
    title: "Home & Garden",
    items: [
      { name: "Furniture", href: "/shop/home/furniture" },
      { name: "Decor", href: "/shop/home/decor" },
      { name: "Kitchen", href: "/shop/home/kitchen" },
      { name: "Bedding", href: "/shop/home/bedding" },
      { name: "Garden Tools", href: "/shop/home/garden" },
    ],
  },
  {
    title: "Sports & Fitness",
    items: [
      { name: "Exercise Equipment", href: "/shop/sports/equipment" },
      { name: "Sportswear", href: "/shop/sports/wear" },
      { name: "Outdoor Gear", href: "/shop/sports/outdoor" },
      { name: "Team Sports", href: "/shop/sports/team" },
      { name: "Fitness Accessories", href: "/shop/sports/accessories" },
    ],
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Get cart and wishlist counts
  const { data: cartCountData } = useGetCartCountQuery();
  const { data: wishlistCountData } = useGetWishlistCountQuery();
  
  const cartCount = cartCountData?.data?.count || 0;
  const wishlistCount = wishlistCountData?.data?.count || 0;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/brand.png"
                alt="Besiks"
                height={100}
                width={100}
                className="object-contain"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-8 relative">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasMegaMenu ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setShowMegaMenu(true)}
                      onMouseLeave={() => setShowMegaMenu(false)}
                    >
                      <Link
                        href={item.href}
                        className="text-gray-900 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </Link>

                      {/* Mega Menu */}
                      {showMegaMenu && (
                        <div className="absolute top-full left-0 w-screen max-w-4xl bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-8 grid grid-cols-4 gap-8 z-50">
                          {megaMenuCategories.map((category) => (
                            <div key={category.title} className="space-y-4">
                              <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
                                {category.title}
                              </h3>
                              <ul className="space-y-2">
                                {category.items.map((subItem) => (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.href}
                                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                                    >
                                      {subItem.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Navigation Links - Center */}

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="pl-10 pr-4 w-80 border-gray-200 rounded-lg"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {showSearchResults && (
                  <SearchResults 
                    query={searchQuery} 
                    onClose={closeSearchResults}
                  />
                )}
              </div>
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600 relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlistCount}
                </Badge>
              )}
              <span className="sr-only">Wishlist</span>
            </Button>

            {/* Cart Sheet */}
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} cartCount={cartCount} />

            {/* User Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search for products..."
                          className="pl-10 pr-4 w-full border-gray-200 rounded-lg"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={handleSearchFocus}
                          onBlur={handleSearchBlur}
                        />
                        {showSearchResults && (
                          <SearchResults 
                            query={searchQuery} 
                            onClose={closeSearchResults}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
