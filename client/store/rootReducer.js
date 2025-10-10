import { authApi } from "@/features/auth/authApi";
import { categoryApi } from "@/features/category/categoryApi";
import { customerApi } from "@/features/customer/customerApi";
import { discountApi } from "@/features/discount/discountApi";
import { productApi } from "@/features/products/productApi";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";

const rootReducer = combineReducers({
  [customerApi.reducerPath]: customerApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [discountApi.reducerPath]: discountApi.reducer,
  [authApi.reducerPath]: authApi.reducer,

  auth: authReducer,
});

export default rootReducer;
