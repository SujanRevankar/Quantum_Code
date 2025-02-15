import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // Tracks the current step: email -> otp -> reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/send-otp", { email });
      if (response.status === 200) {
        toast.success("OTP sent to your email!");
        setStep("otp");
        setTimeLeft(60); // Start 1-minute timer
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP change
  const handleOtpChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value.slice(0, 1); // Only allow 1 digit per input
    setOtp(newOtp);

    // Focus next input if current is filled
    if (e.target.value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const verificationCode = otp.join("");
    if (verificationCode.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/verify-otp", {
        email,
        otp: verificationCode,
      });
      if (response.status === 200) {
        toast.success("OTP verified successfully!");
        setStep("reset");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/reset-password", {
        email,
        password,
      });
      if (response.status === 200) {
        toast.success("Password reset successfully!",{onClose:navigate("/login")});
        // Redirect to login or update UI
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (err) {
      toast.error("Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Timer logic for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white mt-10">
          {step === "email" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-4">Forgot Password</h2>
              <p className="text-center text-gray-600 mb-6">
                Enter your email to receive a verification code.
              </p>
              <form onSubmit={handleSendOtp}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md focus:outline-none focus:border-purple-500 mb-4"
                />
                <button
                  type="submit"
                  className={`w-full py-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500"} text-white rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-4">Verify OTP</h2>
              <p className="text-center text-gray-600 mb-4">Enter the OTP sent to your email.</p>
              <div className="flex justify-between mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-input-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    maxLength="1"
                    className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-purple-500"
                  />
                ))}
              </div>
              {timeLeft > 0 ? (
                <p className="text-center text-gray-600 mb-4">OTP expires in: {timeLeft}s</p>
              ) : (
                <p className="text-center text-red-500 mb-4">OTP has expired!</p>
              )}
              <button
                onClick={handleVerifyOtp}
                className={`w-full py-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500"} text-white rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                disabled={loading || timeLeft <= 0}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>
              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md focus:outline-none focus:border-purple-500 mb-4"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-md focus:outline-none focus:border-purple-500 mb-4"
                />
                <button
                  type="submit"
                  className={`w-full py-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500"} text-white rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
