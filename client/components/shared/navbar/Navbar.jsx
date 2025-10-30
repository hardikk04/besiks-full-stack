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

// pulled dynamically from app settings

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMenuKey, setHoveredMenuKey] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const megaMenuCloseTimeout = useRef(null);
  const { data: settingsData } = useGetSettingsQuery();
  const navMenu = settingsData?.data?.navMenu || [];
  
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

  const openMegaMenu = (key) => {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
      megaMenuCloseTimeout.current = null;
    }
    setHoveredMenuKey(key);
  };

  const scheduleCloseMegaMenu = () => {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
    }
    megaMenuCloseTimeout.current = setTimeout(() => {
      setHoveredMenuKey(null);
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

  // Render nested lists for children beyond the first column level
  const renderNestedList = (children) => {
    if (!Array.isArray(children) || children.length === 0) return null;
    return (
      <ul className="space-y-1">
        {children.map((node) => (
          <li key={node.label} className="space-y-1">
            <Link href={node.href || "#"} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              {node.label}
            </Link>
            {Array.isArray(node.children) && node.children.length > 0 && (
              <div className="pl-3 border-l border-gray-100">
                {renderNestedList(node.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
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
              {navMenu.map((item, index) => {
                const hasChildren = (item.children || []).length > 0;
                const key = item.label || `item-${index}`;
                return (
                  <div key={key} className="relative">
                    {hasChildren ? (
                      <div
                        className="relative"
                        onMouseEnter={() => openMegaMenu(key)}
                        onMouseLeave={scheduleCloseMegaMenu}
                      >
                        <Link
                          href={item.href || "#"}
                          className="text-gray-900 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                        >
                          {item.label}
                          <ChevronDown className="h-4 w-4" />
                        </Link>
                        {hoveredMenuKey === key && (
                          <div
                            className="absolute top-full left-0 w-auto max-w-[95vw] bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-6 grid gap-6 z-50 max-h-[28rem] overflow-auto"
                            style={{ gridTemplateColumns: `repeat(${item.children.length}, minmax(12rem, max-content))` }}
                            onMouseEnter={() => openMegaMenu(key)}
                            onMouseLeave={scheduleCloseMegaMenu}
                          >
                            {item.children.map((child) => (
                              <div key={child.label} className="space-y-3 min-w-[12rem]">
                                <div className="text-gray-900 font-semibold text-base pb-2 border-b border-gray-200">
                                  <Link href={child.href || "#"}>{child.label}</Link>
                                </div>
                                {renderNestedList(child.children)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
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
                  <User strokeWidth={2.5} className="!h-5 !w-5" />
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
                    {navMenu.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <Link
                          href={item.href || "#"}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {Array.isArray(item.children) && item.children.length > 0 && (
                          <div className="pl-3 border-l space-y-1">
                            {item.children.map((c) => (
                              <div key={c.label} className="space-y-1">
                                <Link
                                  href={c.href || "#"}
                                  className="text-gray-700 hover:text-blue-600"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {c.label}
                                </Link>
                                {Array.isArray(c.children) && c.children.length > 0 && (
                                  <div className="pl-3 border-l space-y-1">
                                    {c.children.map((g) => (
                                      <Link
                                        key={g.label}
                                        href={g.href || "#"}
                                        className="text-sm text-gray-600 hover:text-blue-600"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {g.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
