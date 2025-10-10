import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-22">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/brand.png"
                alt="Besiks"
                height={80}
                width={80}
                className="object-contain"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your trusted destination for quality products and exceptional
              service. We bring you the best selection of items at competitive
              prices.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/shop"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Shop All
              </Link>
              <Link
                href="/categories"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Categories
              </Link>
              <Link
                href="/deals"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Special Deals
              </Link>
              <Link
                href="/new-arrivals"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Help & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Help & Support</h3>
            <div className="space-y-2">
              <Link
                href="/contact"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Contact
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Privacy policy
              </Link>

              <Link
                href="/terms-conditions"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Terms and conditions
              </Link>
              <Link
                href="/returns"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Product returns
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-900">
              Sign up for exclusive offers and the latest news!
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Your email..."
                  className="pl-10 border-gray-300"
                />
              </div>
              <Button className="bg-[#174986] text-white px-6">
                Subscribe
              </Button>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-3 pt-4">
              <Link
                href="#"
                className="w-8 h-8 bg-gray-600 text-white rounded flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 bg-gray-600 text-white rounded flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 bg-gray-600 text-white rounded flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Besiks. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
