"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useGetCartCountQuery,
} from "@/features/cart/cartApi";
import { toast } from "sonner";

const CartSheet = ({ isOpen, onOpenChange, cartCount = 0 }) => {
  // Use real API data
  const { data: cartData, isLoading, isError } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const cartItems = cartData?.data?.items || [];
  const totalItems = cartCount;
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem({
        productId,
        quantity: newQuantity,
      }).unwrap();
      toast.success("Cart updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update cart");
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId).unwrap();
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-blue-600 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Shopping cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] flex flex-col"
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
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={item.product.images?.[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.product.category?.name || 'No category'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="text-xs">Remove</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
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
              ))}
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
                <Button className="w-full" size="lg">
                  Proceed to Checkout
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
    </Sheet>
  );
};

export default CartSheet;
