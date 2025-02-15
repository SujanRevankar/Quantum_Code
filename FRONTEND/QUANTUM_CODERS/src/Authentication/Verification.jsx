import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  verifyOTP, 
  resendOTP, 
  updateOTPDigit, 
  decreaseTimer, 
  resetOTPState 
} from './OtpSlice';

const Verification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    otpCode, 
    timeLeft, 
    isResendDisabled, 
    loading, 
    error, 
    success 
  } = useSelector((state) => state.otp);

  const email = localStorage.getItem('email');

  // Timer and initial setup
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decreaseTimer());
    }, 1000);

    // Initial setup checks
    if (!email) {
      toast.error('No email found. Please register again.');
      navigate('/register');
    }

    return () => clearInterval(interval);
  }, [dispatch, email, navigate]);

  // Handle successful verification
  useEffect(() => {
    if (success) {
      toast.success('OTP Verified Successfully!', {
        autoClose: 1000,
        onClose: () => navigate('/login')
      });
    }
  }, [success, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Verification failed');
    }
  }, [error]);

  // Handle OTP digit input
  const handleOTPChange = (e, index) => {
    const digit = e.target.value.slice(0, 1);
    dispatch(updateOTPDigit({ index, digit }));

    // Auto focus next input
    if (digit && index < 5) {
      document.getElementById(`input-${index + 1}`).focus();
    }
  };

  // Submit OTP
  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otpCode.join('');
    
    if (otpString.length === 6) {
      dispatch(verifyOTP({ email, otp: otpString }));
    } else {
      toast.error('Please enter all 6 digits');
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (timeLeft === 0) {
      dispatch(resendOTP(email));
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white mt-10 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-center mb-4">Email Verification</h2>
          <img 
            src="/images/verify-otp.jpeg" // Update with the actual path to your image
            alt="Verification Illustration"
            className="w-1/2 h-auto mb-4" // Adjust styles as needed
          />          
          <div className="mb-4 text-center text-gray-600">
            {timeLeft > 0 ? (
              <p>OTP expires in: {formatTime(timeLeft)}</p>
            ) : (
              <p className="text-red-500">OTP has expired!</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-between mb-4">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  id={`input-${index}`}
                  value={digit}
                  onChange={(e) => handleOTPChange(e, index)}
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-purple-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || timeLeft <= 0}
              className={`w-full py-2 ${loading || timeLeft <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500'} text-white rounded-md hover:bg-purple-900`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <button
            onClick={handleResendOTP}
            disabled={isResendDisabled || timeLeft > 0}
            className={`w-auto px-4 mt-4 py-1 ${(isResendDisabled || timeLeft > 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-900 hover:bg-purple-300'} text-white rounded-md`}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </>
  );
};

export default Verification;