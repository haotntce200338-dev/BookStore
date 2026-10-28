import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import bcrypt from 'bcryptjs';

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

// Security Regex
const MALICIOUS_REGEX = /<[^>]*>|javascript:|data:\s*text\/html|on\w+\s*=/i;
const VIETNAMESE_NAME_REGEX = /^[\p{L}\s]+$/u;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// Helper to verify passwords against bcrypt hash or legacy plaintext
const verifyPassword = (inputPassword, storedPassword) => {
  if (!inputPassword || !storedPassword) return false;
  if (typeof storedPassword === 'string' && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
    try {
      return bcrypt.compareSync(inputPassword, storedPassword);
    } catch {
      return false;
    }
  }
  return inputPassword === storedPassword;
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const cleanUsername = username.trim();
      if (MALICIOUS_REGEX.test(cleanUsername) || MALICIOUS_REGEX.test(password)) {
        return rejectWithValue('Phát hiện ký tự hoặc đoạn mã không an toàn.');
      }

      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { username: cleanUsername },
      });

      const users = response.data;
      const matchedUser = users.find(
        (u) => u.username === cleanUsername && verifyPassword(password, u.password)
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

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, password, fullName }, { rejectWithValue }) => {
    try {
      const cleanUsername = username.trim();
      const cleanFullName = fullName.trim();

      // Anti-injection security guard
      if (
        MALICIOUS_REGEX.test(cleanUsername) ||
        MALICIOUS_REGEX.test(cleanFullName) ||
        MALICIOUS_REGEX.test(password)
      ) {
        return rejectWithValue('Dữ liệu gửi lên chứa ký tự hoặc đoạn mã không an toàn.');
      }

      // Format guards
      if (!VIETNAMESE_NAME_REGEX.test(cleanFullName)) {
        return rejectWithValue('Họ và tên chỉ được chứa chữ cái, không được chứa chữ số hoặc ký tự đặc biệt.');
      }
      if (!USERNAME_REGEX.test(cleanUsername)) {
        return rejectWithValue('Tên đăng nhập chỉ gồm chữ cái không dấu, chữ số và gạch dưới.');
      }

      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;
      const isExisted = users.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (isExisted) {
        return rejectWithValue('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      }

      // Hash password using bcryptjs with 10 salt rounds
      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser = {
        id: `u-${Date.now()}`,
        username: cleanUsername,
        password: hashedPassword,
        fullName: cleanFullName,
        role: 'customer',
        isDeleted: false,
      };

      const createResponse = await axios.post(`${API_BASE_URL}/users`, newUser);
      const { password: _, ...userSession } = createResponse.data;

      localStorage.setItem('currentUser', JSON.stringify(userSession));
      return userSession;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tạo tài khoản. Vui lòng kiểm tra kết nối máy chủ.'
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
      // Login reducers
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
      })
      // Register reducers
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Đăng ký thất bại. Vui lòng thử lại.';
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
