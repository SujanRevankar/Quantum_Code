import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "stompjs";

const NotificationComponent = ({ username }) => {
  const [notifications, setNotifications] = useState([]);
  const [client, setClient] = useState(null);

  useEffect(() => {
    // WebSocket Connection
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Auto reconnect after 5 seconds
    });

    stompClient.onConnect = () => {
      console.log("WebSocket Connected");

      // Subscribe to user's notification queue
      stompClient.subscribe(
        `/user/${username}/queue/notifications`,
        (message) => {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [...prev, notification]);
        }
      );

      // Subscription for accept notifications
      stompClient.subscribe(
        `/user/${username}/queue/notifications/accept`,
        (message) => {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [...prev, notification]);
        }
      );
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error:", frame.headers.message);
    };

    stompClient.activate();
    setClient(stompClient);

    // Cleanup on component unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [username]);

  const sendMessage = (receiver, message, type) => {
    if (client && client.connected) {
      const messageRequest = {
        sender: username,
        reciever: receiver,
        message: message,
        type: type,
      };

      // Send message
      client.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(messageRequest),
      });
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Notifications</h2>

      {/* Notification List */}
      <ul className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <li
              key={index}
              className="p-3 rounded-md shadow-md bg-blue-100 text-blue-800"
            >
              <strong className="block">{notification.sender}:</strong>
              <span>{notification.message}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No notifications yet.</li>
        )}
      </ul>

      {/* Form to Send a Test Notification */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Send Notification</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            id="receiver"
            placeholder="Receiver Username"
            className="p-2 border rounded-md w-full md:w-1/3"
          />
          <input
            id="message"
            placeholder="Message"
            className="p-2 border rounded-md w-full md:w-1/3"
          />
          <button
            onClick={() => {
              const receiver = document.getElementById("receiver").value;
              const message = document.getElementById("message").value;
              sendMessage(receiver, message, "REQUEST");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
