import { configureStore } from "@reduxjs/toolkit";
import { customerApi } from "@/features/customer/customerApi";
import rootReducer from "./rootReducer";
import { productApi } from "@/features/products/productApi";
import { categoryApi } from "@/features/category/categoryApi";
import { discountApi } from "@/features/discount/discountApi";
import { authApi } from "@/features/auth/authApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) => {
    return defaultMiddleware()
      .concat(customerApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(discountApi.middleware)
      .concat(authApi.middleware);
  },
});
