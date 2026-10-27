import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL of the books API.
const API_URL = 'http://localhost:3001/books';

// Default message displayed when the API request fails.
const ERROR_MESSAGE =
  'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';

/**
 * Fetch a book by its ID from JSON Server.
 *
 * @param {string} bookId - The ID of the book to fetch.
 * @returns {Promise<Object>} The book data returned by the API.
 *
 */
export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (bookId, { rejectWithValue }) => {
    try {
      // Request the details of one book using its ID.
      const response = await axios.get(`${API_URL}/${bookId}`);

      // Return the book data to the fulfilled reducer.
      return response.data;
    } catch (error) {
      // Return a specific result when the book does not exist.
      if (error.response && error.response.status === 404) {
        return rejectWithValue({ notFound: true });
      }

      // Return a readable message for other API errors.
      return rejectWithValue({ message: ERROR_MESSAGE });
    }
  }
);

/**
 * Create the Redux slice for the View Book Details feature.
 *
 * currentBook: the book currently being viewed.
 * bookLoading: whether the book request is in progress.
 * bookError: the API error message, if any.
 * bookNotFound: whether the requested book does not exist.
 */
const bookSlice = createSlice({
  name: 'books',

  // Set the initial state of the feature.
  initialState: {
    currentBook: null,
    bookLoading: false,
    bookError: null,
    bookNotFound: false,
  },

  // No synchronous reducers are needed for this feature.
  reducers: {},

  // Handle the pending, fulfilled, and rejected states of the thunk.
  extraReducers: (builder) => {
    builder

      // Run when the API request starts.
      .addCase(fetchBookById.pending, (state) => {
        state.bookLoading = true;
        state.bookError = null;
        state.bookNotFound = false;
        state.currentBook = null;
      })

      // Run when the API request succeeds.
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.bookLoading = false;
        state.currentBook = action.payload;
      })

      // Run when the API request fails.
      .addCase(fetchBookById.rejected, (state, action) => {
        state.bookLoading = false;

        // Check whether the API reported that the book was not found.
        state.bookNotFound = Boolean(action.payload?.notFound);

        // Show an error message only for other kinds of failure.
        state.bookError = action.payload?.notFound
          ? null
          : action.payload?.message || ERROR_MESSAGE;
      });
  },
});

// Export the reducer so it can be registered in the Redux Store.
export default bookSlice.reducer;