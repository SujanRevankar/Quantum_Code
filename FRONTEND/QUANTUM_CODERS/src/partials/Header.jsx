import React, { useState, useRef } from "react";
import { Sword, Shield, Gem, X } from "lucide-react"; // Replace with gaming-themed icons
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useEffect } from "react";
import axios from "axios";

const Header = ({
  isDarkMode,
  toggleTheme,
  totalGold = 5000, // Replace qubits with gold
  totalElixir = 3000, // Add elixir as another resource
  isSidebarHovered,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");
  const [notificationCount, setNotificationCount] = useState(0);

  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const isSubscribed = useRef(false);
  const isAcceptSub = useRef(false);

  const fetchUserDetails = async () => {
    try {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1/get",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await axiosInstance.get("/details");
      if (response.status === 200 && response.data) {
        const updatedProfile = response.data;
        localStorage.setItem("profile", JSON.stringify(updatedProfile));
        console.log("Not count" + updatedProfile.notificationCount);
        console.log("Profile details updated in localStorage:", updatedProfile);
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
      toast.error("Failed to fetch profile details");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    const socket = new SockJS("http://localhost:8001/ws");
    const stompClientInstance = Stomp.over(socket);

    stompClientInstance.connect(
      { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      () => {
        if (profile && profile.username && !isSubscribed.current) {
          const username = profile.username;
          setNotificationCount(profile.notificationCount);

          stompClientInstance.subscribe(
            `/user/${username}/queue/notifications`,
            (notification) => {
              try {
                const receivedMessage = JSON.parse(notification.body);
                if (receivedMessage.type === "Request") {
                  fetchUserDetails();
                  toast.success(
                    `${receivedMessage.sender} has requested to join your clan!`
                  );
                }
              } catch (error) {
                console.error("Error parsing notification message:", error);
              }
            }
          );
          stompClientInstance.subscribe(
            `/user/${username}/queue/notifications/accept`,
            (notification) => {
              try {
                const acceptedMessage = JSON.parse(notification.body);
                if (acceptedMessage.type === "Accept") {
                  fetchUserDetails();
                  toast.success(
                    `${acceptedMessage.reciever} has accepted your clan request!`
                  );
                }
              } catch (error) {
                console.error("Error parsing notification message:", error);
              }
            }
          );
          isSubscribed.current = true;
        }
        setStompClient(stompClientInstance);
      },
      (error) => {
        console.error("WebSocket connection error:", error);
      }
    );

    return () => {
      if (stompClientInstance && stompClientInstance.connected) {
        stompClientInstance.disconnect(() => {
          console.log("WebSocket disconnected");
        });
      }
      isSubscribed.current = false;
    };
  }, [profile?.username]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  // Consistent styles for icons
  const iconStyles = `w-6 h-6 cursor-pointer ${
    isDarkMode ? "text-yellow-400" : "text-yellow-600"
  }`;

  // Sample notification data (gaming-themed)
  const notifications = [
    {
      id: 1,
      message: "Your village is under attack!",
      type: "attack",
      time: "2 mins ago",
    },
    {
      id: 2,
      message: "You've earned 1000 Gold from a raid!",
      type: "reward",
      time: "1 hour ago",
    },
    {
      id: 3,
      message: "Clan war has started!",
      type: "clan",
      time: "Yesterday",
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "attack":
        return "⚔️";
      case "reward":
        return "💰";
      case "clan":
        return "🏰";
      default:
        return "🔔";
    }
  };

  return (
    <header
      className={`flex items-center justify-between p-2 rounded-md transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-gradient-to-r from-blue-900 to-blue-700 border-gray-900"
      } ${isSidebarHovered ? "pl-72" : "pl-20"}`}
    >
      <div></div>
      <div className="flex px-5 items-center space-x-8 w-full justify-end relative">
        {/* Theme Toggle */}
        <div className={iconStyles} onClick={toggleTheme}>
          {isDarkMode ? "☀️" : "🌙"}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <Sword className={iconStyles} onClick={handleNotificationToggle} />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
              {notificationCount}
            </span>
          )}

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto shadow-lg rounded-md border ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              } z-50`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <X
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setIsNotificationOpen(false)}
                />
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`flex items-center p-4 border-b hover:${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      } cursor-pointer`}
                    >
                      <div className="mr-4 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="p-4 text-center border-t">
                <Link
                  to="/notifications"
                  className={`text-sm ${
                    isDarkMode
                      ? "text-yellow-300 hover:text-yellow-200"
                      : "text-yellow-600 hover:text-yellow-700"
                  }`}
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon with Dropdown */}
        <div className="relative">
          <Shield className={iconStyles} onClick={handleDropdownToggle} />
          {isDropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 shadow-lg rounded-md border ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              <ul className="p-2">
                <li
                  className={`px-4 py-2 cursor-pointer hover:${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Link to="/user/profile">Profile</Link>
                </li>
                <li
                  className={`px-4 py-2 cursor-pointer hover:${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  Settings
                </li>
                <li
                  className={`px-4 py-2 cursor-pointer hover:${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  Notifications
                </li>
                <li
                  className={`px-4 py-2 cursor-pointer hover:${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Gold and Elixir Display */}
        <div
          className={`
            px-4 py-2 rounded-full
            ${
              isDarkMode
                ? "bg-purple-900/30 text-purple-300"
                : "bg-purple-100 text-purple-700"
            }
            flex items-center gap-2
          `}
        >
          <span className="text-lg">⚛️</span>
          <span className="font-medium">
            {/* {profile.totalQubits.toLocaleString()} Qubits */}
          </span>
        </div>
      </div>
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
    </header>
  );
};

export default Header;
