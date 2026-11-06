import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL of the orders API.
const API_URL = 'http://localhost:3001/orders';

// Fetch orders belonging to the current customer.
export const fetchCustomerOrders = createAsyncThunk(
  'orders/fetchCustomerOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          userId: userId,
        },
      });

      // Sort orders by date, newest first.
      return response.data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.'
      );
    }
  }
);

// Redux slice for customer order history.
const orderSlice = createSlice({
  name: 'orders',

  initialState: {
    orders: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orders = [];
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải lịch sử đơn hàng.';
      });
  },
});

export default orderSlice.reducer;