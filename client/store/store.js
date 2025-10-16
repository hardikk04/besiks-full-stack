import { configureStore } from "@reduxjs/toolkit";
import { customerApi } from "@/features/customer/customerApi";
import rootReducer from "./rootReducer";
import { productApi } from "@/features/products/productApi";
import { categoryApi } from "@/features/category/categoryApi";
import { discountApi } from "@/features/discount/discountApi";
import { authApi } from "@/features/auth/authApi";
import { orderApi } from "@/features/orders/orderApi";
import { cartApi } from "@/features/cart/cartApi";
import { cartService } from "@/features/cart/cartService";
import { wishlistApi } from "@/features/wishlist/wishlistApi";
import { wishlistService } from "@/features/wishlist/wishlistService";
import { appSettingsApi } from "@/features/appSettings/appSettingsApi";
import { tagApi } from "@/features/tags/tagApi";
import { userApi } from "@/features/user/userApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) => {
    return defaultMiddleware()
      .concat(customerApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(discountApi.middleware)
      .concat(authApi.middleware)
      .concat(orderApi.middleware)
      .concat(cartApi.middleware)
      .concat(cartService.middleware)
      .concat(wishlistApi.middleware)
      .concat(wishlistService.middleware)
      .concat(appSettingsApi.middleware)
      .concat(tagApi.middleware)
      .concat(userApi.middleware);
  },
});
