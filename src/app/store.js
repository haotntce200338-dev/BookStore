import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Other feature reducers will be added here by respective team members:
    // books: bookReducer,
    // cart: cartReducer,
    // categories: categoryReducer,
  },
});

export default store;
