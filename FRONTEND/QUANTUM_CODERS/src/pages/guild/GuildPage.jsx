import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import {
  Shield,
  Sword,
  Users,
  Crown,
  Coins,
  Search,
  Trophy,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GuildPage = () => {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const [modalType, setModalType] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [filteredGuilds, setFilteredGuilds] = useState([]);
  const [guildDetail, setGuildDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [requested, setRequested] = useState("");
  const [formData, setFormData] = useState({
    admin: profile.username || "",
    username: profile.username || "",
    guildname: profile.guildName || "",
  });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const stompClientRef = useRef(null); // Use ref to persist the instance
  const isSubscribed = useRef(false);
  const [stompClient, setStompClient] = useState(null);

  // Fetch all guilds
  async function checkNotificationDetails() {
    if (!profile.username || !token) {
      console.error("Missing username or token");
      setError("Authentication error. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8001/api/v1/get/${profile.username}/notification`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequested(response.data);
    } catch (err) {
      setError("Failed to fetch notification details. Please try again later.");
      console.error("Error fetching notification details:", err);
    }
  }

  useEffect(() => {
    checkNotificationDetails();
    const fetchGuilds = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8001/api/v1/get/all?searchUser=GUILDNAMES",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGuilds(response.data || []);
        setFilteredGuilds(response.data || []);

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
      } catch (err) {
        setError("Failed to fetch guilds");
        console.error("Error fetching guilds:", err);
      }
    };

    fetchGuilds();
  }, [token]);

  // Handle search
  // Handle search (search by guild name or admin username)
  useEffect(() => {
    const filtered = guilds.filter(
      (guild) =>
        guild.guildName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guild.admin.toLowerCase().includes(searchQuery.toLowerCase()) // Search by admin username
    );
    setFilteredGuilds(filtered);
  }, [searchQuery, guilds]);

  // Create new guild
  const handleCreateGuild = async () => {
    if (!formData.guildname.trim()) {
      setError("Guild name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8001/api/v1/createguild",
        {
          admin: formData.admin,
          guildname: formData.guildname.toUpperCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 && response.data === "Success") {
        setError("Guild created successfully! ✅");
        setModalType(null);
        setTimeout(() => window.location.reload(), 1500); // Reload after 1.5s
      } else if (response.status === 208) {
        setError(response.data);
        setModalType(null);
        setTimeout(() => window.location.reload(), 1500); // Reload after 1.5s
      } else {
        setError(err.response?.data || "Failed to create guild");
        setModalType(null);
        setTimeout(() => window.location.reload(), 1500); // Reload after 1.5s
      }
      console.log(response);
    } catch (err) {
      alert("Existed buddy");
      console.log(response);
      if (err.response?.status === 208) {
        setError(`Guild "${formData.guildname}" already exists.`);
      } else {
        setError(err.response?.data || "Failed to create guild");
      }
      console.error("Error creating guild:", err);
    }
  };

  // Join guild
  const handleJoinGuild = async (admin) => {
    console.log("passed" + admin);
    if (stompClient && stompClient.connected) {
      const messageRequest = {
        sender: profile.username,
        reciever: admin,
        message: "Requesting to join the guild",
        type: "GuildRequest",
      };

      // Send message to backend
      stompClient.send("/app/sendMessage", {}, JSON.stringify(messageRequest));
      console.log("Message sent:", messageRequest);
      setTimeout(() => {
        checkNotificationDetails();
      }, 1000);
    } else {
      console.error("Cannot send message. WebSocket not connected yet.");
    }
  };

  // View guild details
  const handleViewGuild = async (guildName) => {
    try {
      const response = await axios.get(
        `http://localhost:8001/api/v1/get/guild/details?guildname=${guildName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGuildDetail(response.data);
      setShowDetail(true);
    } catch (err) {
      setError("Failed to fetch guild details");
      console.error("Error fetching guild details:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="pt-8 px-6 text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2 animate-pulse">
          ⚔️ Realm of Guilds ⚔️
        </h1>
        <p className="text-blue-300 text-lg">
          Join forces, conquer challenges, claim glory!
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>
      <Link to="/user/dashboard">
        <p className="text-red-500 text-bold text-lg ml-10">Home</p>
      </Link>
      {/* Create Guild Button */}
      <button
        onClick={() => setModalType("create")}
        className="ml-6 mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <div className="flex items-center justify-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Create New Guild</span>
        </div>
      </button>
      {/* Post Questions Button */}
      <Link to="/user/guild/post">
        <button className="ml-6 mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-center space-x-2">
            <Sword className="w-5 h-5" />
            <span>Post Challenge</span>
          </div>
        </button>
      </Link>

      {/* Guild Challenges*/}
      {!profile.guildName ? (
        <Link to="/user/guild/challenges">
          <button className="ml-6 mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Guild Challenges</span>
            </div>
          </button>
        </Link>
      ) : (
        <button
          className="ml-6 mt-6 px-6 py-3 bg-gray-400 text-white rounded-lg shadow-lg cursor-not-allowed"
          disabled
        >
          <div className="flex items-center justify-center space-x-2">
            <Sword className="w-5 h-5" />
            <span>Guild Challenges</span>
          </div>
        </button>
      )}
      {/* Guild Challenges*/}
      {!profile.guildName ? (
        <Link to="/user/guild/solve">
          <button className="ml-6 mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Solve Challenges</span>
            </div>
          </button>
        </Link>
      ) : (
        <button
          className="ml-6 mt-6 px-6 py-3 bg-gray-400 text-white rounded-lg shadow-lg cursor-not-allowed"
          disabled
        >
          <div className="flex items-center justify-center space-x-2">
            <Sword className="w-5 h-5" />
            <span>Solve Challenges</span>
          </div>
        </button>
      )}

      {/* Search Bar */}
      <div className="container mx-auto px-6 pt-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a guild..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/80 border-2 border-blue-500/50 rounded-full py-3 px-6 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 text-gray-400 text-sm">
              Found {filteredGuilds.length} guild
              {filteredGuilds.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
      {/* Guild List */}
      <div className="container mx-auto p-6">
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-transparent border-b border-gray-700">
            <h2 className="text-2xl font-bold text-yellow-500 flex items-center">
              <Crown className="w-6 h-6 mr-2" /> Available Guilds
            </h2>
          </div>
          <div className="p-4">
            {filteredGuilds.length > 0 ? (
              <div className="grid grid-cols-3 gap-6 px-4 py-2 border-b border-gray-700 text-gray-300 font-semibold">
                <span>Guild Name</span>
                <span>Admin</span>
                <span className="text-center">Actions</span>
              </div>
            ) : null}
            {filteredGuilds.length > 0 ? (
              filteredGuilds.map((guild, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-6 items-center p-4 border-b border-gray-700 last:border-0 hover:bg-gray-800/50 transition-colors"
                >
                  {/* Guild Name */}
                  <div className="flex items-center space-x-2">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-200">
                      {guild.guildName}
                    </h3>
                  </div>

                  {/* Admin Name */}
                  <h3 className="text-lg font-semibold text-gray-200">
                    {guild.admin}
                  </h3>

                  {/* Actions */}
                  <div className="flex items-center justify-center space-x-4">
                    {console.log(guild.admin)}
                    {profile.guildname === "" && requested === "not present" ? (
                      guild.members.length < 5 ? (
                        <button
                          onClick={() => handleJoinGuild(guild.admin)}
                          className="px-4 py-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white"
                        >
                          Join
                        </button>
                      ) : (
                        <button className="px-4 py-2 rounded-lg transition-colors bg-gray-400 cursor-not-allowed text-white">
                          Join
                        </button>
                      )
                    ) : (
                      <button className="px-4 py-2 rounded-lg transition-colors bg-gray-400 cursor-not-allowed text-white">
                        Join
                      </button>
                    )}

                    <button
                      onClick={() => handleViewGuild(guild.guildName)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-400">
                {searchQuery
                  ? "No guilds found matching your search."
                  : "No guilds available. Be the first to create one!"}
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Modals remain the same ... */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-blue-500 p-6 w-full max-w-md relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Create New Guild
            </h2>
            <input
              type="text"
              placeholder="Enter guild name"
              value={formData.guildname}
              onChange={(e) =>
                setFormData({ ...formData, guildname: e.target.value })
              }
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white mb-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleCreateGuild}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-bold transition-colors"
            >
              Create Guild
            </button>
          </div>
        </div>
      )}
      {/* Guild Details Modal */}
      {showDetail && guildDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-blue-500 p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Guild Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Guild Name:</span>
                <span className="text-white">{guildDetail.guildName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Admin:</span>
                <span className="text-white">{guildDetail.admin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Members:</span>
                <span className="text-white">
                  {guildDetail.members?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Qubits:</span>
                <span className="text-white">{guildDetail.qubits}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDetail(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-bold transition-colors"
            >
              Close
            </button>
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

export default GuildPage;
