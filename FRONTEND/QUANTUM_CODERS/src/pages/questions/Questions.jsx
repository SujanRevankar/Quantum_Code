import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuestions } from "@/redux/actions";
import { Card,
  CardContent,
  CardHeader,
  CardTitle, } from "@/components/ui/Card";
  import { Input } from "@/components/ui/Input";
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from "@/components/ui/Table";
import { Badge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

const Questions = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState("");
  const navigate = useNavigate();

  // const totalQubits=profile.totalQubits;
  // const languages=profile.languages;

  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");
  const stage = profile.stage;
  const username = profile.username;
  const languages = localStorage.getItem("selectedLanguages").split(",");
  console.log(stage);
  console.log(username);

  // useEffect(() => {
  const fetchQuestions = async () => {
    setIsModalOpen(false);
    setLoading(true);

    if (!token) {
      setLoading(false);
      return;
    }

    if (!profile || !stage || !username || !profile.languages) {
      setLoading(false);
      return;
    }

    // Check if questions already exist in localStorage
    const savedQuestions = localStorage.getItem("questions");
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
      setLoading(false);
      return;
    }

    // Fetch questions from API
    try {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1/code",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await axiosInstance.get(
        `/get/${profile.stage}/questions?username=${profile.username}&language=Java`
      );
      console.log(response.data);
      setQuestions(response.data);
      localStorage.setItem("questions", JSON.stringify(response.data)); // Persist to localStorage
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
      setLoading(false);
    }
  };

  //   fetchQuestions();
  // }, [token]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (type) => {
    switch (type.toLowerCase()) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-blue-500">Loading...</div>
      </div>
    );
  }

  const handleLanguageToggle = (language) => {
    console.log("Iam broo");
    setSelectedLanguages(language);
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Sidebar
        activeSection="questions"
        setActiveSection={() => {}}
        isDarkMode={isDarkMode}
        isSidebarHovered={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarHovered ? "pl-72" : "pl-20"
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          totalQubits={profile.totalQubits ?? 0}
          isSidebarHovered={isSidebarHovered}
        />

        {!isModalOpen ? (
          <main className="p-6">
            <Card
              className={
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
              }
            >
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Practice Questions
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search
                      className={`h-4 w-4 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-64 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white"
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className={isDarkMode ? "border-gray-700" : ""}>
                        <TableHead
                          className={`w-16 ${
                            isDarkMode ? "text-gray-300" : ""
                          }`}
                        >
                          #
                        </TableHead>
                        <TableHead
                          className={isDarkMode ? "text-gray-300" : ""}
                        >
                          Question
                        </TableHead>
                        <TableHead
                          className={`w-32 ${
                            isDarkMode ? "text-gray-300" : ""
                          }`}
                        >
                          Difficulty
                        </TableHead>
                        <TableHead
                          className={`w-24 ${
                            isDarkMode ? "text-gray-300" : ""
                          }`}
                        >
                          Qubits
                        </TableHead>
                        <TableHead
                          className={`w-32 ${
                            isDarkMode ? "text-gray-300" : ""
                          }`}
                        >
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question, index) => (
                        <TableRow
                          key={question.questionId}
                          className={
                            isDarkMode
                              ? "border-gray-700 hover:bg-gray-700/50"
                              : "hover:bg-gray-100/50"
                          }
                        >
                          <TableCell
                            className={`font-medium ${
                              isDarkMode ? "text-gray-300" : ""
                            }`}
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${
                              isDarkMode ? "text-gray-300" : ""
                            }`}
                          >
                            {question.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`${getDifficultyColor(
                                question.questionType
                              )} text-white`}
                            >
                              {question.questionType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                isDarkMode
                                  ? "border-gray-600 text-gray-300"
                                  : ""
                              }
                            >
                              {question.qubits}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {question.solved === "true" ? (
                              <div className="flex items-center space-x-1">
                                <Badge
                                  variant="success"
                                  className="bg-green-500 text-white"
                                >
                                  Solved
                                </Badge>
                                <Link
                                  to={{
                                    pathname: `question/${question.questionId}`,
                                    state: { questionId: question.questionId },
                                  }}
                                  className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                                >
                                  View Solution
                                </Link>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                className={`${
                                  isDarkMode
                                    ? "text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                    : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                }`}
                                asChild
                              >
                                <Link
                                  to={{
                                    pathname: `question/${selectedLanguages}/${question.questionId}`,
                                    state: { questionId: question.questionId },
                                  }}
                                >
                                  Solve Challenge
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        ) : (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4">
                Select Programming Languages
              </h3>

              {/* Language Selection UI */}
              <div className="mt-6">
                <h4 className="text-gray-700 font-bold">Select Languages:</h4>
                <div className="flex flex-wrap gap-4 mt-4">
                  {languages.map((language) => (
                    <div
                      key={language}
                      className={`cursor-pointer border rounded-lg p-4 flex items-center space-x-2 
                              ${
                                selectedLanguages === language
                                  ? "bg-purple-100 border-purple-600"
                                  : "border-gray-300"
                              } `}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      <span className="text-sm">{language}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex space-x-4">
                {
                  <button
                    onClick={() => fetchQuestions()}
                    className="w-full py-2 bg-blue-500 text-white rounded-md"
                  >
                    Submit
                  </button>
                }

                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="w-full py-2 bg-gray-500 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Questions;
