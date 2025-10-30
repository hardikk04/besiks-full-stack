"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { useGetSettingsQuery } from "@/features/appSettings/appSettingsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Heart, User, ChevronDown, Package, LogOut } from "lucide-react";
import CartSheet from "@/components/shared/cart/CartSheet";
import WishlistSheet from "@/components/shared/wishlist/WishlistSheet";
import SearchResults from "@/components/shared/search/SearchResults";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartContext } from "@/components/providers/CartProvider";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { toast } from "sonner";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop", hasMegaMenu: true },
  { name: "Hairdryer", href: "#" },
  { name: "Trimmer", href: "#" },
  { name: "About Us", href: "/about" },
];

// pulled from app settings

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const megaMenuCloseTimeout = useRef(null);
  const { data: settingsData } = useGetSettingsQuery();
  const megaMenuCategories = settingsData?.data?.megaMenu || [];
  
  // Get cart context and cart/wishlist counts
  const { isCartOpen, setIsCartOpen } = useCartContext();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

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

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    // Optionally redirect to home page
    window.location.href = "/";
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
  };

  const openMegaMenu = () => {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
      megaMenuCloseTimeout.current = null;
    }
    setShowMegaMenu(true);
  };

  const scheduleCloseMegaMenu = () => {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
    }
    megaMenuCloseTimeout.current = setTimeout(() => {
      setShowMegaMenu(false);
      megaMenuCloseTimeout.current = null;
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimeout.current) {
        clearTimeout(megaMenuCloseTimeout.current);
      }
    };
  }, []);

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
                      onMouseEnter={openMegaMenu}
                      onMouseLeave={scheduleCloseMegaMenu}
                    >
                      <Link
                        href={item.href}
                        className="text-gray-900 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </Link>

                      {/* Mega Menu */}
                      {showMegaMenu && megaMenuCategories?.length > 0 && (
                        <div
                          className="absolute top-full left-0 w-fit max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg mt-2 p-8 grid gap-8 z-50"
                          style={{ gridTemplateColumns: `repeat(${Math.min(megaMenuCategories.length, 6)}, minmax(12rem, 1fr))` }}
                          onMouseEnter={openMegaMenu}
                          onMouseLeave={scheduleCloseMegaMenu}
                        >
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

            {/* Wishlist Sheet */}
            <WishlistSheet isOpen={isWishlistOpen} onOpenChange={setIsWishlistOpen} wishlistCount={wishlistCount} />

            {/* Cart Sheet */}
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} cartCount={cartCount} />

            {/* User Profile Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-blue-600 cursor-pointer"
                >
                  <User strokeWidth={2.5} className="h-5 w-5" />
                  <span className="sr-only">User profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                      {user?.name || "User"}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
