import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user's details
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null); // Use ref to persist the instance
  const isSubscribed = useRef(false);

  const [stompClient, setStompClient] = useState(null);
  // const [sender, setSender] = useState("");
  // const [reciever, setReceiver] = useState("");
  // const [message, setMessage] = useState("");
  // const [type, setType] = useState("");

  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("profile"));
  console.log(profile);

  const navigate = useNavigate();

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        toast.error("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        // Initialize WebSocket connection
        const socket = new SockJS("http://localhost:8001/ws");
        const stompClientInstance = Stomp.over(socket);

        stompClientInstance.connect(
          {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          () => {
            console.log("Connected to WebSocket");
            stompClientRef.current = stompClientInstance;

            // Subscribe after successful connection
            if (!isSubscribed.current) {
              stompClientInstance.subscribe(
                `/user/${profile.username}/queue/responses`,
                (notification) => {
                  try {
                    const receivedMessage = JSON.parse(notification.body);
                    if (receivedMessage.status === "success") {
                      toast.success(receivedMessage.message);
                    } else {
                      toast.error(receivedMessage.message);
                    }
                  } catch (error) {
                    console.error("Error parsing notification message:", error);
                  }
                }
              );

              isSubscribed.current = true; // Mark as subscribed
            }

            setStompClient(stompClientInstance); // Save the WebSocket client instance
          },
          (error) => {
            console.error("WebSocket connection error:", error);
          }
        );

        // Fetch leaderboard data
        const axiosInstance = axios.create({
          baseURL: "http://localhost:8001/api/v1/get",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const response = await axiosInstance.get(`/leaderboard`);
        setLeaderboardData(response.data);
        console.log("Leaderboard Data:", response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Cleanup on component unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  }, [token]);

  const handleConnect = (sender, reciever, message, type) => {
    if (stompClient && stompClient.connected) {
      const messageRequest = {
        sender,
        reciever,
        message,
        type,
      };

      // Send message to backend
      stompClient.send("/app/sendMessage", {}, JSON.stringify(messageRequest));
      console.log("Message sent:", messageRequest);
    } else {
      console.error("Cannot send message. WebSocket not connected yet.");
    }
  };

  // Filter users based on selected category
  const filteredData =
    selectedCategory === "All"
      ? leaderboardData
      : leaderboardData.filter((user) => user.stage === selectedCategory);

  // Open modal with user details
  const handleView = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null); // Reset the selected user
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <Link to="/user/dashboard">
        <p className="text-red-500 text-bold text-lg">Home</p>
      </Link>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
          Leaderboard 🏆
        </h1>
        <div className="flex space-x-2">
          {["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg shadow ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              } hover:bg-blue-600 hover:text-white`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      ) : (
        <div className="overflow-x-auto">
          {/* Table */}
          <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg shadow-md">
            <thead>
              <tr className="text-left border-b-2 border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Rank
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Avatar
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Username
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Stage
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Total Qubits
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Badges
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 dark:border-gray-600"
                  >
                    {/* Rank */}
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      {index + 1}
                    </td>
                    {/* Avatar */}
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-2xl rounded-full">
                        {user.avatar}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      {user.byUserEmail}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      {user.stage}
                    </td>
                    {/* Score */}
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      {user.totalQubits} Qubits ⭐
                    </td>
                    {/* Badges */}
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                      {user.badges}
                    </td>
                    {/* View */}
                    <td>
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-500 hover:underline"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup for User Details (Profile Format) */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Profile
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✖️
              </button>
            </div>

            {/* User Profile Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-4xl text-gray-800 dark:text-gray-100">
                  {selectedUser.avatar || selectedUser.byUserEmail.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {selectedUser.byUserEmail || "No Username"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.role || "No Role"}
                  </p>
                </div>
              </div>

              {/* Profile Details in an Invisible Table */}
              <div className="mt-4">
                <table className="w-full text-left">
                  <tbody>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Email:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.byUserEmail || "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Stage:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.stage || "Not specified"}
                      </td>
                    </tr>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Total Qubits:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.totalQubits} Qubits
                      </td>
                    </tr>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Badges:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.badges || "None"}
                      </td>
                    </tr>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Guild Name:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.guildName || "Not available"}
                      </td>
                    </tr>
                    <tr>
                      <th className="pr-4 py-2 text-gray-700 dark:text-gray-300">
                        Role:
                      </th>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {selectedUser.role || "Not specified"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
              {console.log(profile.connections.length)}
              {profile.username === selectedUser.byUserEmail ? null : profile
                  .connections.length > 0 &&
                profile.connections.includes(selectedUser.byUserEmail) ? (
                <button
                  // Handle the button click
                  className="flex items-center ml-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                >
                  <span className="mr-2">🔗</span> {/* Chain link symbol */}
                  Connected
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleConnect(
                      profile.username,
                      selectedUser.byUserEmail,
                      "Normal Request",
                      "Request"
                    )
                  } // Handle the button click
                  className="flex items-center ml-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                >
                  <span className="mr-2">🔗</span> {/* Chain link symbol */}
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Leaderboard;
