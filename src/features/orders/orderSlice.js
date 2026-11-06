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

// Cancel a pending order belonging to the current customer.
export const cancelCustomerOrder = createAsyncThunk(
  'orders/cancelCustomerOrder',
  async ({ orderId, userId }, { rejectWithValue }) => {
    try {
      // Get the order before cancelling it.
      const orderResponse = await axios.get(`${API_URL}/${orderId}`);
      const order = orderResponse.data;

      // Check whether this order belongs to the current customer.
      if (String(order.userId) !== String(userId)) {
        return rejectWithValue(
          'Bạn không có quyền hủy đơn hàng này.'
        );
      }

      // Only pending orders can be cancelled.
      if (order.status !== 'Pending') {
        return rejectWithValue(
          'Chỉ có thể hủy đơn hàng đang chờ xử lý.'
        );
      }

      // Update the order status.
      const response = await axios.patch(`${API_URL}/${orderId}`, {
        status: 'Cancelled',
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

// Redux slice for customer order history and cancellation.
const orderSlice = createSlice({
  name: 'orders',

  initialState: {
    orders: [],
    loading: false,
    error: null,
    cancellingOrderId: null,
    cancelError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch customer orders.
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelError = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải lịch sử đơn hàng.';
      })

      // Cancel customer order.
      .addCase(cancelCustomerOrder.pending, (state, action) => {
        state.cancellingOrderId = action.meta.arg.orderId;
        state.cancelError = null;
      })
      .addCase(cancelCustomerOrder.fulfilled, (state, action) => {
        state.cancellingOrderId = null;

        const index = state.orders.findIndex(
          (order) => String(order.id) === String(action.payload.id)
        );

        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelCustomerOrder.rejected, (state, action) => {
        state.cancellingOrderId = null;
        state.cancelError =
          action.payload || 'Không thể hủy đơn hàng.';
      });
  },
});

export default orderSlice.reducer;