import { POSTData } from '@/api/httpClient';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: true,
  userRole: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { username: string; password: string; expiresInMins?: number }, { rejectWithValue }) => {
    try {
      const response = await POSTData<{
        token: string;
        refreshToken?: string;
        role: string;
      }>('auth/login', credentials, {
        withCredentials: true, // Include cookies for cross-origin authentication
      });

      // Save tokens to localStorage
      localStorage.setItem('token', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      // Return user role for the reducer
      return { role: response.data.role };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Auth slice definition
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.loading = false;
      state.error = null;

      // Remove tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ role: string }>) => {
        state.isAuthenticated = true;
        state.userRole = action.payload.role;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      });
  },
});

// Exporting the actions and reducer
export const { logout } = authSlice.actions;

export default authSlice.reducer;
