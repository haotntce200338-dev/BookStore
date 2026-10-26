import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Load stored user session from localStorage if present and validate integrity
const storedUser = localStorage.getItem('currentUser');
let initialUser = null;
try {
  const parsed = storedUser ? JSON.parse(storedUser) : null;
  // Security check: Must have valid id, username, and recognized role ('admin' or 'customer')
  if (parsed && parsed.id && parsed.username && ['admin', 'customer'].includes(parsed.role)) {
    initialUser = parsed;
  } else if (storedUser) {
    // If tampered with invalid data, wipe out corrupted/malicious localStorage
    localStorage.removeItem('currentUser');
  }
} catch (error) {
  initialUser = null;
  localStorage.removeItem('currentUser');
}

const initialState = {
  currentUser: initialUser,
  isAuthenticated: !!initialUser,
  role: initialUser ? initialUser.role : null,
  loading: false,
  error: null,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { username: username.trim() },
      });

      const users = response.data;
      const matchedUser = users.find(
        (u) => u.username === username.trim() && u.password === password
      );

      if (!matchedUser) {
        return rejectWithValue('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }

      // Do not store plain password in Redux / localStorage
      const { password: _, ...userSession } = matchedUser;
      localStorage.setItem('currentUser', JSON.stringify(userSession));

      return userSession;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('currentUser');
      state.currentUser = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.role = null;
        state.error = action.payload || 'Đăng nhập thất bại. Vui lòng thử lại.';
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
