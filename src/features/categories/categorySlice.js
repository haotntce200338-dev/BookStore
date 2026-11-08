import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for categories mock API
const API_URL = 'http://localhost:3001/categories';

// Standard fallback error message
const ERROR_MESSAGE =
  'Đã có lỗi xảy ra khi tải dữ liệu thể loại. Vui lòng thử lại sau.';

// Regex to block XSS and malicious script/HTML injection patterns
const MALICIOUS_REGEX = /<[^>]*>|javascript:|data:\s*text\/html|vbscript:|on\w+\s*=|alert\(|eval\(|document\./i;

// Regex for safe Category Name: Letters (with Vietnamese unicode accents), numbers, spaces, and safe punctuation (- & , . / ( ))
const CATEGORY_NAME_SAFE_REGEX = /^[\p{L}\d\s\-&,./()]+$/u;

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

/**
 * Create a new category in JSON Server with anti-XSS validation.
 */
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const cleanName = categoryData?.name?.trim() || '';
      const cleanDesc = categoryData?.description?.trim() || '';

      // Strict validation guard at Thunk level to block devtools / inspect manipulation
      if (
        !cleanName ||
        cleanName.length < 2 ||
        cleanName.length > 50 ||
        MALICIOUS_REGEX.test(cleanName) ||
        !CATEGORY_NAME_SAFE_REGEX.test(cleanName) ||
        MALICIOUS_REGEX.test(cleanDesc) ||
        cleanDesc.length > 250
      ) {
        return rejectWithValue(
          'Dữ liệu gửi lên không hợp lệ hoặc chứa ký tự không an toàn (XSS).'
        );
      }

      const response = await axios.post(API_URL, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo thể loại mới. Vui lòng thử lại!'
      );
    }
  }
);

/**
 * Update an existing category in JSON Server with anti-XSS validation.
 */
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const cleanName = name?.trim() || '';
      const cleanDesc = description?.trim() || '';

      // Strict validation guard at Thunk level to block devtools / inspect manipulation
      if (
        !cleanName ||
        cleanName.length < 2 ||
        cleanName.length > 50 ||
        MALICIOUS_REGEX.test(cleanName) ||
        !CATEGORY_NAME_SAFE_REGEX.test(cleanName) ||
        MALICIOUS_REGEX.test(cleanDesc) ||
        cleanDesc.length > 250
      ) {
        return rejectWithValue(
          'Dữ liệu gửi lên không hợp lệ hoặc chứa ký tự không an toàn (XSS).'
        );
      }

      const response = await axios.patch(`${API_URL}/${id}`, {
        name: cleanName,
        description: cleanDesc || 'Chưa có mô tả',
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thể loại. Vui lòng thử lại!'
      );
    }
  }
);

/**
 * Soft delete a category in JSON Server by setting isDeleted: true.
 */
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${categoryId}`, {
        isDeleted: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa thể loại. Vui lòng thử lại!'
      );
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
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
      })
      // createCategory lifecycle
      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.categories.push(action.payload);
        state.createError = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // updateCategory lifecycle
      .addCase(updateCategory.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        const index = state.categories.findIndex(
          (cat) => String(cat.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.categories[index] = {
            ...state.categories[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // deleteCategory lifecycle (Soft Delete)
      .addCase(deleteCategory.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        state.categories = state.categories.filter(
          (cat) => String(cat.id) !== String(action.payload.id)
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
