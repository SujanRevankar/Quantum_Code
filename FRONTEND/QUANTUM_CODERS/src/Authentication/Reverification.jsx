import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const Reverification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60); 

  const navigate = useNavigate();

  // Handle OTP Timer
  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  // Format timer as MM:SS
  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Send OTP API
  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }
    try{

      const response  = await axios.post("http://localhost:8001/api/v1/auth/send-otp",{email:email});
      // toast.success("Your otp is verified",{autoClose:100})
      // navigate("/user/dashboard")
    }catch(err){
    console.error('Error verifying OTP:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          toast.error(`Error: ${err.response.data.message || 'Please try again later.'}`);
        } else {
          toast.error('Error sending OTP. Please try again later.');
        }
    }
    console.log(email)
    // Mock API Call
    setTimeout(() => {
      toast.success(`OTP is sent to the email : ${email}`)
      setOtpSent(true);
      setTimer(60); // Reset timer
    }, 500);
  };

  // Handle OTP Input
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only numbers
    
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  
    // Auto-focus the next input box if value is entered
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  

  // Verify OTP API
  const handleVerifyOtp = async () => {
    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter all 6 digits.");
      return;
    }
  
    const enteredOtp = otp.join("");
    console.log("Verifying OTP:", otp);
  
    try {
      const response = await axios.post("http://localhost:8001/api/v1/auth/verify-otp", {
        email,
        otp: enteredOtp,
      });
      toast.success("OTP verified successfully!",{autoClose:100},{onclose:navigate("/user/dashboard")});
      console.log("Verification success:", response.data);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast.error(err.response?.data?.message || "Failed to verify OTP.");
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Reverification</h1>

        {/* Email Input */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Send OTP Button */}
        <button
          onClick={handleSendOtp}
          disabled={otpSent}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md transition duration-200 ${
            otpSent ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {otpSent ? `OTP Sent (${formatTimer()})` : "Send OTP"}
        </button>

        {/* OTP Input Boxes */}
        {otpSent && (
          <div className="mt-6 grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                className="w-full p-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
              />
            ))}
          </div>
        )}

        {/* Verify OTP Button */}
{otpSent && otp.every((digit) => digit !== "") && (
  <button
    onClick={() => handleVerifyOtp(otp.join(""))}
    className="w-full mt-4 py-2 px-4 text-white font-semibold bg-green-600 rounded-md hover:bg-green-700 transition duration-200"
  >
    Verify OTP
  </button>
)}


        {/* Timer Expiry Message */}
        {otpSent && timer === 0 && (
          <p className="mt-4 text-red-500 text-center">OTP expired. Please reload to resend otp.</p>
        )}
      </div>
    </div>
  );
};

export default Reverification;
