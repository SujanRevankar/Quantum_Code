import { useState, useEffect } from "react";
import { Trophy, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SolveChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]); // Defaulting challenges to an empty array
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [showTestCases, setShowTestCases] = useState(false); // Controls visibility of test cases

  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // Fetch challenges on component mount
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/v1/get/all/unsolved/approved/problems`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Explicitly filter out challenges from user's own guild
        const filteredChallenges = response.data.filter((challenge) => {
          console.log("Challenge Guild:", challenge.guildname);
          console.log("User Guild:", profile.guildname);
          console.log(challenge.guildName);
          return challenge.guildName !== profile.guildname;
        });

        console.log(profile.guildname);

        setChallenges(filteredChallenges);
        console.log("Filtered Challenges:", filteredChallenges);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setChallenges([]);
      }
    };

    fetchChallenges();
  }, [token, profile.guildname]);

  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setSelectedChallenge(null);
    setIsModalOpen(false);
    setShowTestCases(false); // Reset test case visibility on modal close
  };

  const handleAcceptChallenge = async (guildId) => {
    try {
      const response = await axios.post(
        `http://localhost:8001/api/v1/accept/challenge?username=${profile.username}&guildname=${profile.guildname}&guildId=${guildId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        localStorage.setItem("guildId", guildId);
        toast.success("Accepted challenge succesfully");
        navigate("/user/guild/solve/editor");
      } else if (response.status === 404) {
        toast.error("Not found");
      } else {
        toast.error("Bad request");
      }
      setChallenges(
        challenges.filter((challenge) => challenge.guildId !== guildId) // Remove accepted challenge from list
      );
      console.log(challenges);
    } catch (error) {
      console.error("Error accepting challenge:", error);
      alert("❌ Error accepting challenge");
    }
  };

  //   const guildID = localStorage.setItem();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8 flex items-center justify-between">
          <Link to={"/user/dashboard"}>
            <img src="/images/logo.png" className="h-12" alt="Logo" />
          </Link>
          <div className="flex space-x-4">
            <span className="text-lg">⚛️</span>
            <span className="text-2xl font-bold">
              {profile.totalQubits} Qubits
            </span>
          </div>
        </div>

        {/* Challenges container */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-yellow-400">
            Unsolved Guild Challenges
          </h2>

          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.guildId}
                onClick={() => handleChallengeClick(challenge)}
                className="p-6 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-102 bg-gradient-to-r from-yellow-900 to-yellow-800 hover:shadow-lg hover:shadow-yellow-600/50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-300">
                    {challenge.title}
                  </span>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold">
                      +{challenge.qubits} Qubits
                    </span>
                  </div>
                </div>
                <p className="text-xl font-medium text-white mb-2">
                  {challenge.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm px-3 py-1 rounded-full bg-yellow-900 text-yellow-200">
                    {challenge.status}
                  </span>
                </div>

                {/* Accept Challenge */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening modal when clicking accept
                    handleAcceptChallenge(challenge.guildId);
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center space-x-2 transition duration-300"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Accept Challenge</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Challenge Details */}
        {isModalOpen && selectedChallenge && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 px-4 py-10">
            <div className="w-full max-w-2xl bg-gray-900 text-white p-6 shadow-lg border-4 border-yellow-500 rounded-lg">
              <div className="flex justify-between items-center border-b border-yellow-500 pb-3 mb-3">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {selectedChallenge.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-lg text-gray-300 mb-4">
                {selectedChallenge.description}
              </p>
              <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-yellow-400 font-bold">📥 Input Format:</p>
                <p className="text-gray-300">{selectedChallenge.inputFormat}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-yellow-400 font-bold">📤 Output Format:</p>
                <p className="text-gray-300">
                  {selectedChallenge.outputFormat}
                </p>
              </div>

              <button
                onClick={() => setShowTestCases(!showTestCases)}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg mb-4"
              >
                {showTestCases ? "Hide Test Cases" : "Show Test Cases"}
              </button>

              {showTestCases && (
                <div className="max-h-40 overflow-y-auto bg-gray-800 p-3 rounded-lg mb-3">
                  <h3 className="text-yellow-400 font-bold">
                    📝 Example Test Cases
                  </h3>
                  {selectedChallenge.exampleTestCaes.map((test, index) => (
                    <div key={index} className="p-2 border-b border-gray-700">
                      <p className="text-gray-300">
                        🔹 <strong>Input:</strong> {test.input}
                      </p>
                      <p className="text-gray-300">
                        🔹 <strong>Output:</strong> {test.expectedOutput}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-gray-300">
                  ⏳ <strong>Time Limit:</strong> {selectedChallenge.timeLimit}{" "}
                  sec
                </p>
                <p className="text-yellow-400 font-bold">
                  🏆 {selectedChallenge.qubits} Qubits
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default SolveChallenges;
