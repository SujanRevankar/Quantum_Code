import { useState, useEffect } from "react";
import { Trophy, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

const QuestionList = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]); // Defaulting questions to an empty array
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [showTestCases, setShowTestCases] = useState(false); // Controls visibility of test cases

  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/v1/get/${profile.guildname}/${profile.username}/not_approved_questions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuestions(Array.isArray(response.data) ? response.data : []); // Ensure response is an array
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [profile.username, profile.guildname, token]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setIsModalOpen(false);
    setShowTestCases(false); // Reset test case visibility on modal close
  };

  const handleApprove = async (guildId) => {
    try {
      const approve = await axios.post(
        `http://localhost:8001/api/v1/approve?username=${profile.username}&guildname=${profile.guildname}&guildId=${guildId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(approve.data);
      setQuestions(
        questions.map((q) =>
          q.guildId === guildId
            ? { ...q, approvedBy: [...q.approvedBy, profile.username] }
            : q
        )
      );
    } catch (error) {
      console.error("Approval error:", error);
      alert("❌ Error approving question");
    }
  };

  const hasAlreadyApproved = (approvedUsers) => {
    return approvedUsers.includes(profile.username);
  };

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

        {/* Questions container */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-yellow-400">
            Unapproved Questions
          </h2>

          <div className="grid gap-4">
            {questions.map((q) => (
              <div
                key={q.guildId}
                onClick={() => handleQuestionClick(q)}
                className="p-6 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-102 bg-gradient-to-r from-yellow-900 to-yellow-800 hover:shadow-lg hover:shadow-yellow-600/50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-300">
                    {q.title}
                  </span>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold">
                      +{q.qubits} Qubits
                    </span>
                  </div>
                </div>
                <p className="text-xl font-medium text-white mb-2">
                  {q.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm px-3 py-1 rounded-full bg-yellow-900 text-yellow-200">
                    {q.status}
                  </span>
                </div>

                {/* Check if already approved */}
                {hasAlreadyApproved(q.approvedBy) ? (
                  <button
                    disabled
                    className="mt-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg flex items-center space-x-2 transition duration-300"
                  >
                    <span>Approved</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening modal when clicking approve
                      handleApprove(q.guildId);
                    }}
                    className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center space-x-2 transition duration-300"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Question Details */}
        {isModalOpen && selectedQuestion && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 px-4 py-10">
            <div className="w-full max-w-2xl bg-gray-900 text-white p-6 shadow-lg border-4 border-yellow-500 rounded-lg">
              <div className="flex justify-between items-center border-b border-yellow-500 pb-3 mb-3">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {selectedQuestion.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-lg text-gray-300 mb-4">
                {selectedQuestion.description}
              </p>
              <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-yellow-400 font-bold">📥 Input Format:</p>
                <p className="text-gray-300">{selectedQuestion.inputFormat}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-yellow-400 font-bold">📤 Output Format:</p>
                <p className="text-gray-300">{selectedQuestion.outputFormat}</p>
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
                  {selectedQuestion.exampleTestCaes.map((test, index) => (
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
                  ⏳ <strong>Time Limit:</strong> {selectedQuestion.timeLimit}{" "}
                  sec
                </p>
                <p className="text-yellow-400 font-bold">
                  🏆 {selectedQuestion.qubits} Qubits
                </p>
              </div>

              {hasAlreadyApproved(selectedQuestion.approvedBy) ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded-lg flex justify-center items-center space-x-2"
                >
                  <span>Approved</span>
                </button>
              ) : (
                <button
                  onClick={() => handleApprove(selectedQuestion.guildId)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex justify-center items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionList;
