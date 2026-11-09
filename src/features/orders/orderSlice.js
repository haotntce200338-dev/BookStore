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

// Cancel a customer order and save the cancellation reason.
export const cancelCustomerOrder = createAsyncThunk(
  'orders/cancelCustomerOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      if (!reason || !reason.trim()) {
        return rejectWithValue('Vui lòng nhập lý do hủy đơn hàng.');
      }

      const response = await axios.patch(`${API_URL}/${orderId}`, {
        status: 'Cancelled',
        cancelReason: reason.trim(),
        cancellationReason: reason.trim(),
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể hủy đơn hàng. Vui lòng thử lại.'
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
    cancelLoading: false,
    cancelError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch customer orders.
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Không thể tải lịch sử đơn hàng.';
      })

      // Cancel customer order.
      .addCase(cancelCustomerOrder.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelCustomerOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;

        // Update the cancelled order in Redux state.
        const index = state.orders.findIndex(
          (order) => String(order.id) === String(action.payload.id)
        );

        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelCustomerOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError =
          action.payload || 'Không thể hủy đơn hàng.';
      });
  },
});

export default orderSlice.reducer;