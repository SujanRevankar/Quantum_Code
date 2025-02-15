import React, { useState } from "react";
import { Shield, Sword, Scroll, Castle, Crown } from "lucide-react"; // Fantasy Icons
import { Link } from "react-router-dom";

const Sidebar = ({
  activeSection,
  setActiveSection,
  isDarkMode,
  isSidebarHovered, // Pass the hover state as a prop
  setIsSidebarHovered, // Pass the hover updater function as a prop
}) => {
  const sidebarItems = [
    {
      icon: <Sword className="w-5 h-5" />,
      label: "Conquer Challenges",
      section: "individual-challenges",
      path: "/user/individual-challenges",
      description:
        "Rise to the challenge and test your coding prowess in individual quests.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Guild Wars",
      section: "guild-challenges",
      path: "/user/guild-page",
      description:
        "Assemble your guild, engage in epic battles, and conquer together!",
    },
    {
      icon: <Crown className="w-5 h-5" />,
      label: "Epic Community",
      section: "community",
      path: "/user/community",
      description:
        "Join forces with fellow adventurers and grow your coding kingdom.",
    },
    {
      icon: <Scroll className="w-5 h-5" />,
      label: "The Grand Tome",
      section: "documentation",
      path: "/user/documentation",
      description:
        "Dive into the ancient scrolls and master the platform’s secrets.",
    },
    {
      icon: <Castle className="w-5 h-5" />,
      label: "Top Warriors",
      section: "leaderboards",
      path: "/user/leaderboards",
      description:
        "See who stands tall in the realm and claim your place among the greats.",
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 
        ${
          isDarkMode
            ? "bg-gradient-to-b from-black via-gray-800 to-gray-900"
            : "bg-gradient-to-b from-gray-900 to-gray-800"
        } 
        ${isSidebarHovered ? "w-72" : "w-20"} 
        overflow-hidden`}
      onMouseEnter={() => setIsSidebarHovered(true)} // Update hover state
      onMouseLeave={() => setIsSidebarHovered(false)} // Reset hover state
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <Link to="/user/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Company Logo"
              className={`md:h-15 h-12 transition-all duration-300 ${
                isSidebarHovered ? "h-12" : "h-8"
              }`}
            />
            <h2
              className={`text-xl text-white font-bold transition-opacity duration-300 ${
                isSidebarHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              QuantumCode
            </h2>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="p-4">
        {sidebarItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer 
              ${
                activeSection === item.section
                  ? "bg-gradient-to-r from-purple-700 to-purple-900 text-yellow-400 shadow-lg"
                  : "hover:bg-gradient-to-r from-blue-600 to-purple-600 text-gray-200 hover:text-yellow-400"
              }
              ${isSidebarHovered ? "" : "justify-center"}`}
            onClick={() => setActiveSection(item.section)}
          >
            {/* Icon */}
            <div className="flex items-center justify-center bg-gray-800 rounded-full p-2">
              {item.icon}
            </div>
            {isSidebarHovered && (
              <div className="flex flex-col ml-3">
                <h3 className="text-sm font-medium">{item.label}</h3>
                {item.description && (
                  <p className="text-xs text-white mt-1">{item.description}</p>
                )}
              </div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
