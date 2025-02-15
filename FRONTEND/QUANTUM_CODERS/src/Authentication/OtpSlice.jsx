import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for verifying OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8001/api/v1/auth/verify-otp', {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'OTP Verification Failed');
    }
  }
);

// Async thunk for resending OTP
export const resendOTP = createAsyncThunk(
  'auth/resendOTP', 
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8001/api/v1/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to resend OTP');
    }
  }
);

// OTP Slice
const otpSlice = createSlice({
  name: 'otp',
  initialState: {
    otpCode: ['', '', '', '', '', ''],
    timeLeft: 60,
    isResendDisabled: true,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    // Update individual OTP digit
    updateOTPDigit: (state, action) => {
      const { index, digit } = action.payload;
      state.otpCode[index] = digit;
    },
    // Decrease timer
    decreaseTimer: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
        if (state.timeLeft === 0) {
          state.isResendDisabled = false;
        }
      }
    },
    // Reset timer
    resetTimer: (state) => {
      state.timeLeft = 60;
      state.isResendDisabled = true;
    },
    // Reset state
    resetOTPState: (state) => {
      state.otpCode = ['', '', '', '', '', ''];
      state.timeLeft = 60;
      state.isResendDisabled = true;
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyOTP.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    })
    .addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    // Resend OTP
    .addCase(resendOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resendOTP.fulfilled, (state) => {
      state.loading = false;
      state.timeLeft = 60;
      state.isResendDisabled = true;
      state.error = null;
    })
    .addCase(resendOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isResendDisabled = false;
    });
  }
});

export const { 
  updateOTPDigit, 
  decreaseTimer, 
  resetTimer, 
  resetOTPState 
} = otpSlice.actions;

export default otpSlice.reducer;