import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      console.log("Attempting login with:", formData); // Debug log
  
      const response = await axios.post("http://localhost:8001/api/v1/auth/login", formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log("Full response:", response); // Debug log
      const { token } = response.data;
  
      console.log("Received token:", token); // Debug log
  
      // Simplified token handling
      if (token && token !== "Invalid email or password" && token !== "User not verified") {
        localStorage.setItem("token", token);
        toast.success("Login successful!"); // Show toast
  
        // Navigate to dashboard after login success
        navigate("/user/dashboard");
  
      } else if (token === "Invalid email or password") {
        toast.error("Invalid email or password");
      } else if (token === "User not verified") {
        toast.error("User not verified. Please check your email.");
        navigate("/re-verify");
      }
    } catch (err) {
      console.error("Login Error:", err.response ? err.response.data : err); // Comprehensive error logging
  
      if (err.response) {
        toast.error(err.response.data.message || "Login failed. Please try again.");
      } else if (err.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Error setting up login request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <>
      <ToastContainer /> {/* Ensure toast notifications are visible */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex items-center mb-4">
              <img
                src="/images/logo2.jpg"
                alt="Company Logo"
                className="md:h-20 h-12 mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold text-purple-600">quantumcode</h2>
                <p className="text-gray-600">Learn. Evolve. Code</p>
              </div>
            </div>

            <input
              type="email"
              name="email"
              placeholder="Enter your Email ID"
              className="w-full p-2 mb-4 border rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-2 mb-4 border rounded"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-500 transition duration-300"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-gray-500 mt-4">
              Don't have an account?{" "}
              <a href="/signup" className="text-purple-600 hover:underline">
                Sign Up
              </a>
            </p>
            <p className="text-center text-gray-500 mt-4">
              <a href="/forgot-password" className="text-purple-600 hover:underline">
                Forgot Password
              </a>
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;