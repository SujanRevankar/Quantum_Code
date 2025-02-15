import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/partials/Header";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const NotificationPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const stompClientRef = useRef(null); // Use ref to persist the instance
  const isSubscribed = useRef(false);
  const [accept, setAccept] = useState(false);
  // let stompClientInstance = null;
  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("profile"));
  console.log(profile);

  const fetchNotifications = async () => {
    if (!token) {
      toast.error("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await axiosInstance.get(
        `/get/notifications?username=${profile.username}&guildname=${profile.guildname}`
      );
      console.log(response.data);
      if (response.data === "No record found") setNotifications("");
      else setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:8001/ws");
    const stompClientInstance = Stomp.over(socket);

    stompClientInstance.connect(
      {},
      () => {
        console.log("Connected to a websocket");
        setStompClient(stompClientInstance);
      },
      (error) => {
        console.error("WebSocket connection error:", error);
      }
    );

    fetchNotifications();
  }, [token]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const onReject = async (id,message) => {
    setLoading(true);
    try {
      const notificationInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await notificationInstance.delete(
        "/delete/notification",
        {
          data: {
            id: id,
            message:message
          },
        }
      );

      console.log("Response:", response.data);
      fetchNotifications();
      // alert("Notification rejected successfully!");
      // Optionally, update the state to remove the rejected notification
    } catch (error) {
      setLoading(false);
      console.error(
        "Error rejecting notification:",
        error.response?.data || error.message
      );
      alert("Failed to reject the notification.");
    }
  };

  

  const initializeWebSocket = async () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS("http://localhost:8001/ws");
      const stompClientInstance = Stomp.over(socket);
  
      stompClientInstance.connect(
        {},
        () => {
          console.log("WebSocket connected");
          resolve();
          stompClientInstance.subscribe(
            `/user/${username}/queue/notifications/failed`,
            (notification) => {
              try {
                const receivedMessage = JSON.parse(notification.body);

                  toast.error(
                    `${receivedMessage} has requested to follow you`
                  );
              } catch (error) {
                console.error("Error parsing notification message:", error);
              }
            }
          );
          setStompClient(stompClientInstance);
        },
        (error) => {
          console.error("WebSocket connection failed", error);
          reject(error);
        }
      );
    });

  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onAccept = async (request) => {
    const { sender, reciever, message, type } = request;
  
    if (!stompClient || !stompClient.connected) {
      try {
        await initializeWebSocket(); // Ensure WebSocket is connected
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        return;
      }
    }
  
    if (stompClient && stompClient.connected) {
      stompClient.send(
        "/app/sendReqAccMessage",
        {},
        JSON.stringify({ sender, reciever, message, type })
      );
      console.log("Message sent via WebSocket");
  
      // Add delay before fetching notifications
      setLoading(true);
      await delay(3000); // Wait for 3000ms (3 seconds)
      await fetchNotifications();
      setLoading(false);
    } else {
      console.error("Cannot send message. WebSocket not connected.");
    }
  };
  
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-blue-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-purple-600">
          Notifications
        </h1>

        <div className="mt-4">
          {notifications.length > 0 ? (
            <div className="request-list bg-gray-100 p-6 rounded-lg shadow-md">
              {notifications.map((request) => (
                <div
                  key={request.id}
                  className="request-item bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="request-info mb-4">
                    {(profile.username != request.sender ||
                      profile.guildname === request.sender) && (
                      <p className="text-gray-700 font-medium">
                        <strong>Sender:</strong> {request.sender}
                      </p>
                    )}
                    <p className="text-gray-700 font-medium">
                      <strong>Receiver:</strong> {request.reciever}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong> {request.status}
                    </p>
                    <p className="text-gray-600">
                      <strong>Message:</strong> {request.message}
                    </p>
                    <p className="text-gray-600">
                      <strong>Type:</strong> {request.type}
                    </p>
                    <p className="text-gray-500 text-sm">
                      <strong>Timestamp:</strong>{" "}
                      {new Date(request.timeStamp).toLocaleString()}
                    </p>
                  </div>
                  {profile.username === request.sender ||
                  profile.guildname === request.sender ? (
                    <div>
                      {request.status==="ACCEPTED"?
                      <button
                        className="reject-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={() => onReject(request.id,"ok")}
                      >
                        OK
                      </button>:
                      <button
                        className="reject-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={() => onReject(request.id,"cancel")}
                      >
                        Cancel Request
                      </button>}
                    </div>
                  ) : (
                    <div className="request-actions flex space-x-4">
                      {request.reciever === profile.username &&
                      request.status === "ACCEPTED" ? (
                        <button className="accept-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                          Accepted
                        </button>
                      ) : (
                        <button
                          className="accept-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          onClick={() => onAccept(request)}
                        >
                          Accept
                        </button>
                      )}
                      {request.reciever === profile.username &&
                      request.status === "ACCEPTED" ? (
                        <button
                          className="reject-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          onClick={() => onReject(request.id,"remove")}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          className="reject-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          onClick={() => onReject(request.id,"reject")}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No notifications available.</p>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default NotificationPage;
