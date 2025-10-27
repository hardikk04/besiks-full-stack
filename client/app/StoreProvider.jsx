"use client";
import { store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import CartMergeProvider from "@/components/providers/CartMergeProvider";
import { CartProvider } from "@/components/providers/CartProvider";

const StoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <CartProvider>
        <CartMergeProvider>
          {children}
        </CartMergeProvider>
      </CartProvider>
    </Provider>
  );
};

export default StoreProvider;
