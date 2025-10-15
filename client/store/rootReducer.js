import { authApi } from "@/features/auth/authApi";
import { categoryApi } from "@/features/category/categoryApi";
import { customerApi } from "@/features/customer/customerApi";
import { discountApi } from "@/features/discount/discountApi";
import { productApi } from "@/features/products/productApi";
import { orderApi } from "@/features/orders/orderApi";
import { cartApi } from "@/features/cart/cartApi";
import { wishlistApi } from "@/features/wishlist/wishlistApi";
import { appSettingsApi } from "@/features/appSettings/appSettingsApi";
import { tagApi } from "@/features/tags/tagApi";
import { userApi } from "@/features/user/userApi";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";

const rootReducer = combineReducers({
  [customerApi.reducerPath]: customerApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [discountApi.reducerPath]: discountApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [wishlistApi.reducerPath]: wishlistApi.reducer,
  [appSettingsApi.reducerPath]: appSettingsApi.reducer,
  [tagApi.reducerPath]: tagApi.reducer,
  [userApi.reducerPath]: userApi.reducer,

  auth: authReducer,
});

export default rootReducer;
