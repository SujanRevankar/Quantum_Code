import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for sending OTP
export const sendOtp = createAsyncThunk(
  'otp/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/send-otp", { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send OTP');
    }
  }
);

// Async thunk for verifying OTP
export const verifyOtp = createAsyncThunk(
  'otp/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/verify-otp", { 
        email, 
        otp 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to verify OTP');
    }
  }
);

const otpSliceVerify = createSlice({
  name: 'otp',
  initialState: {
    email: '',
    otpSent: false,
    isLoading: false,
    error: null,
    timer: 60,
    canResend: false
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.isLoading = false;
      state.error = null;
      state.timer = 60;
      state.canResend = false;
    },
    decrementTimer: (state) => {
      state.timer -= 1;
      if (state.timer === 0) {
        state.canResend = true;
      }
    }
  },
  extraReducers: (builder) => {
    // Send OTP Reducers
    builder.addCase(sendOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendOtp.fulfilled, (state) => {
      state.otpSent = true;
      state.isLoading = false;
      state.timer = 60;
      state.canResend = false;
    });
    builder.addCase(sendOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.otpSent = false;
    });

    // Verify OTP Reducers
    builder.addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state) => {
      state.isLoading = false;
      state.otpSent = false;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

export const { 
  setEmail, 
  resetOtpState, 
  decrementTimer 
} = otpSliceVerify.actions;

export default otpSliceVerify.reducer;