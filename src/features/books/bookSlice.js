import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL of the books API.
const API_URL = 'http://localhost:3001/books';

// Default message displayed when the API request fails.
const ERROR_MESSAGE =
  'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';

/**
 * Fetch all active books from JSON Server.
 * Used for the Public Books Catalog feature (HaoTNT).
 *
 * @returns {Promise<Array>} List of books returned by the API.
 */
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      // Filter out soft-deleted books if any
      return response.data.filter((book) => !book.isDeleted);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || ERROR_MESSAGE
      );
    }
  }
);

/**
 * Fetch a book by its ID from JSON Server.
 * Used for the View Book Details feature (TuanTA).
 *
 * @param {string} bookId - The ID of the book to fetch.
 * @returns {Promise<Object>} The book data returned by the API.
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
 * Fetches related books from the same category.
 * Excludes the current book and deleted books.
 *
 * @param {Object} params - Parameters used to find related books.
 * @param {string} params.categoryId - The category ID of the current book.
 * @param {string} params.currentBookId - The ID of the current book.
 * @returns {Promise<Array>} A list of related books.
 */
export const fetchRelatedBooks = createAsyncThunk(
  'books/fetchRelatedBooks',
  async ({ categoryId, currentBookId }, { rejectWithValue }) => {
    try {
      // Get books that belong to the same category.
      const response = await axios.get(API_URL, {
        params: {
          categoryId: categoryId,
        },
      });

      // Exclude the current book and deleted books.
      const relatedBooks = response.data.filter(
        (book) =>
          !book.isDeleted &&
          String(book.id) !== String(currentBookId)
      );

      // Return up to 4 related books.
      return relatedBooks.slice(0, 4);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || ERROR_MESSAGE
      );
    }
  }
);

/**
 * Redux slice for the books module.
 * Combines both Public Books Catalog (HaoTNT) and View Book Details, View Related Books (TuanTA).
 */
const bookSlice = createSlice({
  name: 'books',

  initialState: {
    // Single book details state (TuanTA)
    currentBook: null,
    bookLoading: false,
    bookError: null,
    bookNotFound: false,

    // Related books state (TuanTA)
    relatedBooks: [],
    relatedLoading: false,
    relatedError: null,

    // Public books catalog state (HaoTNT)
    books: [],
    booksLoading: false,
    booksError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // 1. fetchBooks - Public Catalog (HaoTNT)
      .addCase(fetchBooks.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksLoading = false;
        state.books = action.payload;
        state.booksError = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload || ERROR_MESSAGE;
      })

      // 2. fetchBookById - Book Details (TuanTA)
      .addCase(fetchBookById.pending, (state) => {
        state.bookLoading = true;
        state.bookError = null;
        state.bookNotFound = false;
        state.currentBook = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.bookLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.bookLoading = false;
        state.bookNotFound = Boolean(action.payload?.notFound);
        state.bookError = action.payload?.notFound
          ? null
          : action.payload?.message || ERROR_MESSAGE;
      })

      // 3. fetchRelatedBooks - Related Books (TuanTA)
      .addCase(fetchRelatedBooks.pending, (state) => {
        state.relatedLoading = true;
        state.relatedError = null;
        state.relatedBooks = [];
      })
      .addCase(fetchRelatedBooks.fulfilled, (state, action) => {
        state.relatedLoading = false;
        state.relatedBooks = action.payload;
      })
      .addCase(fetchRelatedBooks.rejected, (state, action) => {
        state.relatedLoading = false;
        state.relatedError = action.payload || ERROR_MESSAGE;
      });
  },
});

export default bookSlice.reducer;
