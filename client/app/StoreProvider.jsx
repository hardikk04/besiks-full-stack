"use client";
import { store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import CartMergeProvider from "@/components/providers/CartMergeProvider";

const StoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <CartMergeProvider>
        {children}
      </CartMergeProvider>
    </Provider>
  );
};

export default StoreProvider;
