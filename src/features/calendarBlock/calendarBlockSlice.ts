// src/features/calendarBlock/calendarBlockSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { environment } from '@/config'; // assuming your environment file holds API URLs
import axiosInstance from '@/services/axiosInstance';

interface CalendarBlockState {
  message: string;
  isBlocked: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CalendarBlockState = {
  message: '',
  isBlocked: false,
  loading: false,
  error: null,
};

// Async thunk to fetch the calendar block message
export const fetchCalendarBlockMessage = createAsyncThunk(
  'calendarBlock/fetchMessage',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Admin/ISEmployeeCalenderHidden/${userId}`);
      //console.log(response, 'response is coming ');
      const data = await response?.data;
      //console.log(data, 'this is data . . .');
      return {
        message: data?.message,
        isBlocked: data?.data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const calendarBlockSlice = createSlice({
  name: 'calendarBlock',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarBlockMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalendarBlockMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isBlocked = action.payload.isBlocked;
      })
      .addCase(fetchCalendarBlockMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default calendarBlockSlice.reducer;
