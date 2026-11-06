import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookReducer from '../features/books/bookSlice';
import cartReducer from '../features/cart/cartSlice';
import categoryReducer from '../features/categories/categorySlice';
import orderReducer from '../features/orders/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    cart: cartReducer,
    categories: categoryReducer,
    orders: orderReducer,
  },
});

export default store;
