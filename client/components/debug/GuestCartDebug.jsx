"use client";

import { useSelector } from "react-redux";
import { useCart } from "@/hooks/useCart";

const GuestCartDebug = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const guestCart = useSelector((state) => state.guestCart);
  const { cart, cartCount } = useCart();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Cart Debug Info</h3>
      <div className="text-xs space-y-1">
        <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
        <p><strong>Cart Count:</strong> {cartCount}</p>
        <p><strong>Guest Cart Items:</strong> {guestCart.items.length}</p>
        <p><strong>Guest Cart Total:</strong> ₹{guestCart.totalPrice}</p>
        <p><strong>Current Cart Items:</strong> {cart.items?.length || 0}</p>
        <p><strong>Current Cart Total:</strong> ₹{cart.totalPrice || 0}</p>
      </div>
    </div>
  );
};

export default GuestCartDebug;
