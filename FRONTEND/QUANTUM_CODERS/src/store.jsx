import { configureStore } from '@reduxjs/toolkit';
import otpReducer from './Authentication/OtpSlice';
import otpReducerVerify from './Authentication/OtpSliceVerify';

export const store = configureStore({
  reducer: {
    otp: otpReducer,
  },
});

export const storeVerify = configureStore({
    reducer: {
        otpVerify: otpReducerVerify,
    },
    });

export default store;  // Add this line