import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for categories mock API
const API_URL = 'http://localhost:3001/categories';

// Standard fallback error message
const ERROR_MESSAGE =
  'Đã có lỗi xảy ra khi tải dữ liệu thể loại. Vui lòng thử lại sau.';

/**
 * Fetch all active categories from JSON Server.
 * Filters out any soft-deleted categories.
 */
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      // Filter out soft-deleted categories if any
      return response.data.filter((category) => !category.isDeleted);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || ERROR_MESSAGE
      );
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories lifecycle
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || ERROR_MESSAGE;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;

