import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookReducer from '../features/books/bookSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Reducer for the View Book Details feature.
    books: bookReducer,
    // Other feature reducers will be added here by respective team members:
    // books: bookReducer,
    // cart: cartReducer,
    // categories: categoryReducer,
  },
});

export default store;
