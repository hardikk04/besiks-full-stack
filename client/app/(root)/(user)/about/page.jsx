"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Send,
  Truck,
  CheckCircle,
  CreditCard,
  Recycle,
} from "lucide-react";

const page = () => {
  useEffect(() => {
    document.title = "Besiks - About";
  }, []);
  return (
    <>
      <section className="min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-center space-y-8">
              {/* Our Story Header */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#121212] mb-6">
                  Our Story
                </h1>

                <div className="text-4xl md:text-5xl lg:text-6xl text-gray-700 font-script italic mb-6">
                  About
                </div>

                {/* Main Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#121212] mb-8">
                  Besiks
                </h1>
              </div>

              {/* Description */}
              <div className="space-y-4 mx-auto lg:mx-0 flex justify-center">
                <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
                  Discover Uniquely Crafted Bouquets and Gifts for Any Occasion:
                  Spread Joy with Our Online Flower Delivery Service
                </p>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center lg:justify-center space-x-4 pt-8">
                {/* Instagram */}
                <Link
                  href="#"
                  className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-600" />
                </Link>

                {/* Pinterest */}
                <Link
                  href="#"
                  className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.374 0 0 5.372 0 12.017 0 16.4 2.331 20.027 5.72 21.852c-.067-.6-.125-1.517.027-2.166.138-.601.893-3.777.893-3.777s-.227-.456-.227-1.129c0-1.058.613-1.848 1.376-1.848.649 0 .963.487.963 1.07 0 .651-.415 1.625-.628 2.528-.179.756.378 1.372 1.123 1.372 1.348 0 2.383-1.423 2.383-3.478 0-1.818-1.306-3.087-3.168-3.087-2.16 0-3.429 1.618-3.429 3.292 0 .651.25 1.35.562 1.729.062.074.071.139.052.215-.056.238-.182.738-.207.842-.032.13-.104.158-.24.095-1.127-.523-1.831-2.166-1.831-3.487 0-2.391 1.738-4.587 5.011-4.587 2.627 0 4.673 1.873 4.673 4.376 0 2.61-1.646 4.711-3.932 4.711-.767 0-1.493-.399-1.741-.878l-.474 1.806c-.171.667-.636 1.505-.947 2.015C10.566 23.781 11.268 24 12.001 24c6.624 0 11.999-5.371 11.999-12.003C24 5.372 18.626.001 12.001.001z" />
                  </svg>
                </Link>

                {/* Facebook */}
                <Link
                  href="#"
                  className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-gray-600" />
                </Link>

                {/* Twitter */}
                <Link
                  href="#"
                  className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-600" />
                </Link>

                {/* Telegram */}
                <Link
                  href="#"
                  className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Send className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full">
                <Image
                  src="https://plus.unsplash.com/premium_photo-1743020414629-442467fad611?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Professional woman in brown blazer standing next to modern shelving with decorative items"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1158&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern minimalist living room with dark sofa, wooden coffee table, and pampas grass in a vase"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8 order-1 lg:order-2 pt-[15%]">
              {/* Main Heading */}
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2A254B] leading-tight mb-8">
                  Our service isn't just personal, it's actually hyper
                  personally exquisite
                </h2>
              </div>

              {/* Description Paragraphs */}
              <div className="space-y-6 max-w-lg">
                <p className="text-[#505977] text-base leading-relaxed">
                  When we started Avion, the idea was simple. Make high quality
                  furniture affordable and available for the mass market.
                </p>

                <p className="text-[#505977] text-base leading-relaxed">
                  Handmade, and lovingly crafted furniture and homeware is what
                  we live, breathe and design so our Chelsea boutique become the
                  hotbed for the London interior design community.
                </p>
              </div>

              {/* Get in touch Button */}
              <div className="pt-12">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-3 text-gray-800 bg-[#F9F9F9] hover:bg-gray-800 hover:text-white transition-all duration-300 text-base"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What makes our brand different */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2A254B] leading-tight">
              What makes our brand different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Next day as standard */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start mb-4">
                <Truck className="w-6 h-6 text-[#2A254B]" />
              </div>
              <h3 className="text-xl text-[#2A254B] mb-3">
                Next day as standard
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Order before 3pm and get your order the next day as standard
              </p>
            </div>

            {/* Made by true artisans */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start mb-4">
                <CheckCircle className="w-6 h-6 text-[#2A254B]" />
              </div>
              <h3 className="text-xl text-[#2A254B] mb-3">
                Made by true artisans
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Handmade crafted goods made with real passion and craftmanship
              </p>
            </div>

            {/* Unbeatable prices */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start mb-4">
                <CreditCard className="w-6 h-6 text-[#2A254B]" />
              </div>
              <h3 className="text-xl text-[#2A254B] mb-3">Unbeatable prices</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                For our materials and quality you won't find better prices
                anywhere
              </p>
            </div>

            {/* Recycled packaging */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start mb-4">
                <Recycle className="w-6 h-6 text-[#2A254B]" />
              </div>
              <h3 className="text-xl text-[#2A254B] mb-3">
                Recycled packaging
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We use 100% recycled packaging to ensure our footprint is
                manageable
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
