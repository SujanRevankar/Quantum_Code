import React, { useState, useEffect } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import { ToastContainer } from "react-toastify";
import { Shield, Sword, Crown } from "lucide-react"; // Change icons to match the theme
import { toast } from "react-toastify"; // Ensure this is imported for error handling
import axios from "axios";

const DashboardContent = ({
  isDarkMode,
  recentChallenges = [],
  guildInformation = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("challenges");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Initially set to false
  const [selectedCodingLanguage, setSelectedCodingLanguages] = useState([]);
  const [lang, setLang] = useState();
  const [onSubmit, setOnSubmit] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!token) {
        toast.error("No authentication token found");
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
        const languagesArray = response.data.languages.map(
          (language) => language
        );
        setSelectedCodingLanguages(languagesArray);
        localStorage.setItem("profile", JSON.stringify(response.data));
        localStorage.setItem("selectedLanguages", languagesArray);
        setProfileDetails(response.data); // Set profile details
      } catch (error) {
        console.error("Error fetching profile details:", error);
        toast.error("Failed to fetch profile details");
      }
    };

    fetchProfileDetails();
  }, [token]);

  const handleLanguageToggle = (language) => {
    setLang(language);
    setSelectedLanguages((prevLanguages) => {
      if (prevLanguages.includes(language)) {
        setOnSubmit(false); // Set onSubmit to false when a language is deselected
        return prevLanguages.filter((lang) => lang !== language); // Deselect if already selected
      } else {
        setOnSubmit(true); // Set onSubmit to true when a language is selected
        return [...prevLanguages, language]; // Select if not already selected
      }
    });
  };

  const handleCloseModal = () => {
    try {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1/get",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      axiosInstance.post("/add/languages", {
        username: profileDetails.username,
        language: lang,
      });

      setSelectedCodingLanguages((prevLanguages) => [...prevLanguages, lang]);
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
    setIsModalOpen(false); // Close the modal
  };

  // Filter challenges or guilds based on the search query
  const filteredChallenges = recentChallenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuilds = guildInformation.filter((guild) =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define your available languages
  const languagesList = [
    { name: "Python" },
    { name: "Java" },
    // Add more languages as needed
  ];

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        activeSection="dashboard"
        setActiveSection={() => {}}
        isDarkMode={isDarkMode}
        isSidebarHovered={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarHovered ? "pl-72" : "pl-20"
        }`}
      >
        {/* Header */}
        <Header isDarkMode={isDarkMode} />

        {/* Search Bar and Tab Selector */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 pl-4 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("challenges")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "challenges"
                    ? isDarkMode
                      ? "bg-purple-500 text-white"
                      : "bg-purple-100 text-purple-800"
                    : isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-800"
                }`}
              >
                Challenges
              </button>
              <button
                onClick={() => setActiveTab("guilds")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "guilds"
                    ? isDarkMode
                      ? "bg-purple-500 text-white"
                      : "bg-purple-100 text-purple-800"
                    : isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-800"
                }`}
              >
                Guilds
              </button>
            </div>
          </div>

          {/* Display Selected Languages Above Modal */}
          {selectedCodingLanguage.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Selected Languages:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCodingLanguage.map(
                  (language, index) =>
                    language != null && (
                      <div
                        key={index}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm"
                      >
                        {language}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {selectedCodingLanguage.length < 2 && (
            <div className="mt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Languages
              </button>
            </div>
          )}

          {/* Modal for Selecting Languages */}
          {isModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-xl font-semibold mb-4">
                  Select Programming Languages
                </h3>

                {/* Language Selection UI */}
                <div className="mt-6">
                  <h4 className="text-gray-700 font-bold">Select Languages:</h4>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {languagesList.map(
                      (language) =>
                        !selectedCodingLanguage.includes(language.name) && (
                          <div
                            key={language.name}
                            className={`cursor-pointer border rounded-lg p-4 flex items-center space-x-2 ${
                              selectedLanguages.includes(language.name)
                                ? "bg-purple-100 border-purple-600"
                                : "border-gray-300"
                            }`}
                            onClick={() => handleLanguageToggle(language.name)}
                          >
                            <span className="text-sm">{language.name}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-4">
                  {onSubmit && (
                    <button
                      onClick={handleCloseModal}
                      className="w-full py-2 bg-blue-500 text-white rounded-md"
                    >
                      Submit
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 bg-gray-500 text-white rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "challenges" && (
              <div
                className={`p-6 rounded-lg shadow-md ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Sword className="mr-2 text-yellow-500" /> Recent Challenges
                </h2>
                {recentChallenges.length > 0 ? (
                  recentChallenges.map((challenge, index) => (
                    <div
                      key={index}
                      className={`p-4 mb-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{challenge.title}</p>
                          <p
                            className={`text-sm ${
                              challenge.status === "Completed"
                                ? "text-green-500"
                                : challenge.status === "Pending"
                                ? "text-yellow-500"
                                : "text-blue-500"
                            }`}
                          >
                            {challenge.status}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 mr-1 text-purple-500" />
                          <span>{challenge.qubits} Qubits</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No challenges found.</p>
                )}
              </div>
            )}

            {activeTab === "guilds" && (
              <div
                className={`p-6 rounded-lg shadow-md ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="mr-2 text-yellow-500" /> Guild Information
                </h2>
                {guildInformation.length > 0 ? (
                  guildInformation.map((guild, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <h3 className="text-lg font-bold mb-3">{guild.name}</h3>
                      <div className="space-y-2">
                        <p>Members: {guild.members}</p>
                        <p>Active Projects: {guild.activeProjects}</p>
                        <p>
                          <Crown className="inline-block w-4 h-4 mr-1 text-yellow-500" />
                          Total Qubits: {guild.totalQubits}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No guilds found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default DashboardContent;
