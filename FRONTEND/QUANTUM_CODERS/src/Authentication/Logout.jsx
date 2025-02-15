import React from 'react';
import { useNavigate } from 'react-router-dom';  // For navigation
import { toast, ToastContainer } from 'react-toastify';  // Importing toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';  // Importing styles
import axios from 'axios';  // Importing axios for HTTP requests

const Logout = () => {
  const navigate = useNavigate();  // For navigating to login page

  // Create an axios instance with default configuration
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8001/api/v1/auth',  // Replace with your API base URL
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const handleLogout = () => {
    const token = localStorage.getItem("token");

    // Show confirmation toast
    const logoutToast = toast(
      <div className="flex items-center">
        <span className="mr-2">Are you sure you want to log out?</span>
        <button
          onClick={async () => {
            try {
              if (token) {
                // Make a POST request using axiosInstance
                const response = await axiosInstance.post(
                  '/logout',  // Endpoint for logout
                  {},
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,  // Adding token to header
                    }
                  }
                );

                // Check if the response is successful (e.g., 200 status code)
                if (response.status === 200) {
                  // Clear the token from localStorage
                  localStorage.removeItem("token");

                  // Show success toast
                  toast.success("You have successfully logged out!");
                  localStorage.clear();

                  // Navigate to login page after 3 seconds
                  setTimeout(() => {
                    navigate("/login"); // Assuming '/login' is the path to your login page
                  });
                } else {
                  toast.error("Failed to log out. Please try again.");
                }
              } else {
                toast.error("No token found. Please log in again.");
              }
            } catch (error) {
              toast.error("An error occurred. Please try again.");
              console.error(error);
            }
          }}
          className="bg-green-500 text-white w-28 py-1 px-3 rounded mr-2"
        >
          Yes
        </button>
        <button
          onClick={() => {
            toast.dismiss(logoutToast);  // Dismiss the toast if user chooses No
          }}
          className="bg-red-500 text-white w-28 py-1 px-3 rounded"
        >
          No
        </button>
      </div>,
      {
        position: "top-center",
        autoClose: false, // Prevent auto-close so the user can choose Yes or No
        closeOnClick: false,
        draggable: false,
        pauseOnHover: true,
        hideProgressBar: true,
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold mb-4">Are you sure you want to log out?</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Toast container to render the toasts */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Logout;
