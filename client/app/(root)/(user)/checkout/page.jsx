"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, MapPin, Package, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useConfirmPaymentMutation } from "@/features/orders/orderApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, isLoading: cartLoading, createOrderFromCart } = useCart();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  const [confirmPayment, { isLoading: isConfirmingPayment }] = useConfirmPaymentMutation();
  
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });
  
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed with checkout");
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart.items || cart.items.length === 0)) {
      toast.error("Your cart is empty");
      router.push("/shop");
      return;
    }
  }, [cart, cartLoading, router]);

  const handleInputChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.zipCode && 
           shippingAddress.country;
  };

  const calculateTotals = () => {
    const itemsPrice = cart.totalPrice || 0;
    const taxPrice = itemsPrice * 0.1; // 10% tax
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    };
  };

  const handleCheckout = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Prepare order items
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images?.[0] || "/placeholder.jpg"
      }));

      const totals = calculateTotals();

      // Create order
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        itemsPrice: totals.itemsPrice,
        taxPrice: totals.taxPrice,
        shippingPrice: totals.shippingPrice,
        totalPrice: totals.totalPrice
      };

      const result = await createOrderFromCart(orderData);
      setCreatedOrder(result.data);

      // For Razorpay integration, you would typically:
      // 1. Initialize Razorpay with order details
      // 2. Handle payment success/failure
      // 3. Call confirmPayment API

      // For now, let's simulate a successful payment
      toast.success("Order created successfully!");
      
      // Redirect to order confirmation page
      router.push(`/orders/${result.data._id}`);

    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error?.data?.message || "Failed to create order");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to proceed with checkout</p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shopping
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={shippingAddress.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay">Razorpay (Credit/Debit Card, UPI, Net Banking)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash_on_delivery" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
                <Button variant="outline">Apply</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <Image
                      src={item.product.images?.[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-semibold text-sm">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Order Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>Rs. {totals.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>Rs. {totals.taxPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {totals.shippingPrice === 0 ? (
                    <Badge variant="secondary">FREE</Badge>
                  ) : (
                    `Rs. ${totals.shippingPrice.toLocaleString()}`
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rs. {totals.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handleCheckout}
            disabled={!isFormValid() || isProcessingPayment}
            className="w-full"
            size="lg"
          >
            {isProcessingPayment ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Place Order
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
