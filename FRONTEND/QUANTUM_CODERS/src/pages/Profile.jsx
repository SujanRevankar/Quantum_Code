import React, { useState, useEffect } from "react";
import {
  Shield,
  Sword,
  Users,
  Trophy,
  Code,
  Terminal,
  Coffee,
  Bell,
  Star,
  Medal,
  Zap,
  Target,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

// Badge configuration
const BADGE_TIERS = [
  {
    threshold: 10,
    icon: Star,
    name: "Novice Explorer",
    color: "text-gray-400",
  },
  {
    threshold: 20,
    icon: Medal,
    name: "Apprentice Adventurer",
    color: "text-blue-400",
  },
  {
    threshold: 30,
    icon: Zap,
    name: "Quantum Initiate",
    color: "text-purple-400",
  },
  {
    threshold: 40,
    icon: Target,
    name: "Guild Challenger",
    color: "text-green-400",
  },
  {
    threshold: 50,
    icon: Rocket,
    name: "Master Strategist",
    color: "text-orange-400",
  },
];

const Profile = () => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");

  const token = localStorage.getItem("token");

  // Function to determine current badge
  const getCurrentBadge = (totalQubits) => {
    for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
      if (totalQubits >= BADGE_TIERS[i].threshold) {
        return BADGE_TIERS[i];
      }
    }
    return null;
  };

  // Function to calculate next badge progress
  const getNextBadgeProgress = (totalQubits) => {
    const currentBadgeIndex = BADGE_TIERS.findIndex(
      (tier) => totalQubits < tier.threshold
    );
    if (currentBadgeIndex === -1) return 100;

    const currentTier = BADGE_TIERS[currentBadgeIndex];
    const prevTier =
      currentBadgeIndex > 0
        ? BADGE_TIERS[currentBadgeIndex - 1]
        : { threshold: 0 };

    const progress =
      ((totalQubits - prevTier.threshold) /
        (currentTier.threshold - prevTier.threshold)) *
      100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!token) {
        toast.error("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const axiosInstance = axios.create({
          baseURL: "http://localhost:8001/api/v1/get",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const response = await axiosInstance.get("/details");
        setProfileDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile details:", error);
        toast.error("Failed to fetch profile details");
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [token]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-900 to-purple-700">
        <div className="text-2xl text-purple-200 animate-pulse">
          Loading your village...
        </div>
      </div>
    );
  }

  const currentBadge = getCurrentBadge(profileDetails?.totalQubits || 0);
  const nextBadgeProgress = getNextBadgeProgress(
    profileDetails?.totalQubits || 0
  );

  return (
    <div className="flex h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDarkMode={isDarkMode}
        isSidebarHovered={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarHovered ? "ml-72" : "ml-20"
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          totalQubits={profileDetails?.totalQubits ?? 0}
        />

        <div
          className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 ${
            isDarkMode ? "brightness-75" : ""
          }`}
        >
          <div className="container mx-auto px-4 pt-8">
            {/* Badge Section */}
            <div className="mb-8 text-center">
              {currentBadge && (
                <div className="inline-flex flex-col items-center">
                  <div className={`mb-2 ${currentBadge.color}`}>
                    <currentBadge.icon size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentBadge.name}
                  </h2>
                  <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${nextBadgeProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-300 mt-1">
                    {nextBadgeProgress < 100
                      ? `Next badge at ${
                          BADGE_TIERS.find(
                            (tier) =>
                              tier.threshold >
                              (profileDetails?.totalQubits || 0)
                          )?.threshold
                        } qubits`
                      : "Maximum badge achieved!"}
                  </p>
                </div>
              )}
            </div>

            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 inline-block p-6 rounded-full mb-4 border-4 border-blue-300 shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {profileDetails?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {profileDetails?.username || "Warrior"}'s Guild
              </h1>
              <p className="text-blue-300">
                Level {Math.floor((profileDetails?.totalQubits || 0) / 100) + 1}{" "}
                Guildmaster
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-lg border-2 border-orange-300 transform hover:scale-105 transition-transform shadow-lg">
                <div className="flex flex-col items-center text-white">
                  <Trophy size={32} className="mb-2" />
                  <p className="text-lg font-bold">Total Qubits</p>
                  <p className="text-2xl font-bold">
                    {profileDetails?.totalQubits || 0}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-lg border-2 border-emerald-300 transform hover:scale-105 transition-transform shadow-lg">
                <div className="flex flex-col items-center text-white">
                  <Shield size={32} className="mb-2" />
                  <p className="text-lg font-bold">Badges</p>
                  <p className="text-2xl font-bold">
                    {profileDetails?.badges || 0}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-lg border-2 border-violet-300 transform hover:scale-105 transition-transform shadow-lg">
                <div className="flex flex-col items-center text-white">
                  <Users size={32} className="mb-2" />
                  <p className="text-lg font-bold">Guild Members</p>
                  <p className="text-2xl font-bold">
                    {profileDetails?.connections?.length || 0}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-lg border-2 border-blue-300 transform hover:scale-105 transition-transform shadow-lg">
                <div className="flex flex-col items-center text-white">
                  <Sword size={32} className="mb-2" />
                  <p className="text-lg font-bold">Challenges Won</p>
                  <p className="text-2xl font-bold">
                    {profileDetails?.allQuestions || 0}
                  </p>
                </div>
              </Card>
            </div>

            {/* Battle Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-gray-900 to-purple-900 p-6 rounded-lg border-2 border-purple-400 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Challenge Statistics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-orange-200">
                    <Coffee className="w-6 h-6" />
                    <div>
                      <p className="text-sm">Java Mastery</p>
                      <p className="text-xl font-bold">
                        {profileDetails?.javaSolvedQuestions || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-200">
                    <Terminal className="w-6 h-6" />
                    <div>
                      <p className="text-sm">Python Mastery</p>
                      <p className="text-xl font-bold">
                        {profileDetails?.pythonSolvedQuestions || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 to-purple-900 p-6 rounded-lg border-2 border-purple-400 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Guild Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-emerald-200">
                    <span>Guild Name:</span>
                    <span className="font-bold">
                      {profileDetails?.guildname || "No Guild"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-blue-200">
                    <span>Guild Role:</span>
                    <span className="font-bold">
                      {profileDetails?.role || "Initiate"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Details */}
            <Card className="bg-gradient-to-br from-gray-900 to-purple-900 p-6 rounded-lg border-2 border-purple-400 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Member Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between p-2 border-b border-gray-700">
                  <span className="text-blue-200">Username:</span>
                  <span className="font-bold text-white">
                    {profileDetails?.username}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-700">
                  <span className="text-blue-200">Email:</span>
                  <span className="font-bold text-white">
                    {profileDetails?.email}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-700">
                  <span className="text-blue-200">Stage:</span>
                  <span className="font-bold text-white">
                    {profileDetails?.stage || "Apprentice"}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-700">
                  <span className="text-blue-200">Guild Notifications:</span>
                  <span className="font-bold text-white">
                    {profileDetails?.notificationCount || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;
