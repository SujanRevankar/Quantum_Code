import React, { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";

const CodingPlatform = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const lang = useParams().language;
  console.log("lannanan");
  console.log(lang);
  const token = localStorage.getItem("token");

  const profile = JSON.parse(localStorage.getItem("profile"));

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [output, setOutput] = useState("");
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [qubits, setQubits] = useState(0);
  const [code, setCode] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [problemData, setProblemData] = useState(null);
  const [language, setLanguage] = useState(lang);

  // Chatbot states
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  // Define the boilerplate code for Python and Java
  const boilerPlateCode = {
    python: `if __name__ == "__main__":\n    # Write code here to read input, calculate the quotient, and print the result\n    pass`,
    java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write code here to read input, calculate the quotient, and print the result\n        sc.close();\n    }\n}`,
  };

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    // Add user message to chat
    const userMessage = { text: question, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const chatResponse = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAD6yasWqoB1B5sv3uuR6vZqc960BI_hIY",
        method: "POST",
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });

      // Extract the bot's response
      const botResponseText =
        chatResponse.data.candidates[0].content.parts[0].text;

      // Add bot message to chat
      const botMessage = { text: botResponseText, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Clear the input field
      setQuestion("");
    } catch (error) {
      console.error("Error in sending message:", error);
      const errorMessage = {
        text: "Sorry, there was an error processing your request.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  // Toggle chatbot open/close
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handle Enter key press in chatbot input
  const handleChatKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const fetchProblemData = async () => {
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    try {
      const axiosInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1/code",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await axiosInstance.get(`/get?questionId=${id}`);
      setProblemData(response.data);
      if (language === "Python")
        setCode(response.data.boilerPlateCode[0]?.python);
      else setCode(response.data.boilerPlateCode[1]?.java);

      // setCode(response.data.languages.Java)
    } catch (error) {
      console.error("Error fetching problem data:", error);
      toast.error("Failed to fetch problem data");
    }
  };

  useEffect(() => {
    fetchProblemData();
  }, [id, token]);

  useEffect(() => {
    // Load code from localStorage when the component mounts or when `id` changes
    const savedCode = localStorage.getItem(`code_${id}`);
    if (savedCode) {
      setCode(savedCode); // Set code from localStorage
    } else {
      setCode(boilerPlateCode[language]); // Set default boilerplate code if no saved code
    }
  }, [id, language]);

  useEffect(() => {
    // Set the code based on the selected language when it changes
    localStorage.setItem("selectedLanguages", language);
  }, [language]);

  // const handleCodeChange = (value)=>{
  //   setCode(value);
  //   localStorage.setItem(`code-${id}-${language}`,value)
  // };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    console.log("Question Details:");
    console.log("questionId:", id);
    console.log("username:", profile.username); // Replace with actual logged-in username
    console.log("status:", profile.stage); // Status can also be dynamic based on user actions
    console.log("questionType:", problemData.questionType); // You can change it dynamically if needed
    console.log("code:", code);
    console.log("language:", profile.languages[0]);
    console.log("qubits:", problemData.qubits);
    console.log("testCases:", problemData.exampleTestCases);
    try {
      const questionInstance = axios.create({
        baseURL: "http://localhost:8001/api/v1/code",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const questionResponse = await questionInstance.post("/execute", {
        questionId: id,
        username: profile.username, // Replace with actual logged-in username
        status: profile.stage, // Status can also be dynamic based on user actions
        questionType: problemData.questionType, // You can change it dynamically if needed
        code: code,
        language: profile.languages[0],
        qubits: problemData.qubits,
        testCases: problemData.exampleTestCases, // Optional: add any test cases if required
      });

      const executionResult = questionResponse.data;
      console.log(questionResponse.data);
      setOutput(executionResult.outputAndQubits.overAllOutput);
      setTestCaseResults(executionResult.testCaseResults);
      setQubits(executionResult.outputAndQubits.qubits);

      console.log(output);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(error.response.data);
      setTestCaseResults([]);
    }
    setIsRunning(false);
  };

  const handleSubmitCode = () => {
    toast.success("Code Submitted!");
  };

  const handleCodeChange = (value) => {
    setCode(value);
    localStorage.setItem(`code_${id}`, value);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem(`language`, e.target.value);
  };

  if (!problemData) return <div>Loading problem...</div>;

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-stone-200 text-black"
      }`}
    >
      {/* Top Navigation */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-stone-100 text-black"
        }`}
      >
        {/* Chatbot Section */}
        <div className="fixed bottom-6 right-6 z-50">
          {/* Chatbot Icon */}
          <button
            className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-110"
            onClick={toggleChatbot}
          >
            {isOpen ? (
              <X className="h-8 w-8" />
            ) : (
              <MessageCircle className="h-8 w-8" />
            )}
          </button>

          {/* Chatbot Window */}
          {isOpen && (
            <div className="fixed bottom-24 right-6 w-1/2 max-w-xl min-w-[300px] bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col h-[460px]">
              {/* Chat Header */}
              <div className="bg-blue-500 text-white p-2 rounded-t-lg">
                <h3 className="text-lg font-semibold">Alice AI Chatbot</h3>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-2 max-h-80">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.sender === "user"
                        ? "bg-blue-100 text-blue-800 self-end ml-auto"
                        : "bg-gray-100 text-gray-800 self-start"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex p-4 border-t border-gray-200">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Type your message..."
                  className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  rows="3" // This sets the initial height of the textarea, which you can adjust as needed
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-stone-100 text-black"
        }`}
      >
        <Link to={"/user/individual-challenges"}>
          <img src="/images/logo.png" className="h-12" alt="Logo" />
        </Link>
        <div className="flex items-center space-x-4">
          <button
            className={`h-9 w-20 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-stone-200 hover:bg-stone-400 text-black"
            } font-semibold focus:outline-none focus:ring-2 focus:ring-stone-300`}
            onClick={handleRunCode}
          >
            Run
          </button>
          <button
            className={`h-9 w-20 ${
              isDarkMode
                ? "bg-green-700 hover:bg-gray-600 text-green-500"
                : "bg-stone-200 hover:bg-stone-400 text-green-600"
            } font-semibold focus:outline-none focus:ring-2 focus:ring-stone-300`}
            onClick={handleSubmitCode}
          >
            Submit
          </button>
          <button
            className={`h-9 w-20 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-stone-200 hover:bg-stone-400 text-black"
            } font-semibold focus:outline-none focus:ring-2 focus:ring-stone-300`}
            onClick={toggleDarkMode}
          >
            {isDarkMode ? "Light" : "Dark"}
          </button>
          <button
            className={`h-9 w-32 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-stone-200 text-black"
            } font-semibold focus:outline-none focus:ring-2 focus:ring-stone-300`}
          >
            {language}
          </button>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel
          defaultSize={40}
          minSize={30}
          maxSize={60}
          className={`overflow-hidden ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <div className="h-full overflow-y-auto p-4 italic">
            <h2 className="text-xl font-bold mb-4">{problemData.title}</h2>
            <p className="text-md mb-4">
              <span className="text-md font-semibold">Description : </span>
              {problemData.questionDescription}
            </p>

            {/* Existing problem details */}
            <div className="space-y-6">
              <p>
                <strong>Memory Limit:</strong> {problemData.memoryLimit}
              </p>
              <p>
                <strong>Input Format:</strong> {problemData.inputFormat}
              </p>
              <p>
                <strong>Output Format:</strong> {problemData.outputFormat}
              </p>
              <p>
                <strong>Space Complexity:</strong> {problemData.spaceComplexity}
              </p>
              <p>
                <strong>Time Complexity:</strong> {problemData.timeComplexity}
              </p>
              <p>
                <strong>Time Limit:</strong> {problemData.timeLimit}
              </p>
              <div>
                <strong>Constraints:</strong>
                {problemData.constraints &&
                problemData.constraints.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {problemData.constraints.map((constraint, index) => (
                      <li key={index}>{constraint.constraint}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No constraints available</p>
                )}
              </div>
              <p>
                <strong>Hint:</strong> {problemData.hint}
              </p>
              <p>
                <strong>Knowledge Gained:</strong> {problemData.knowledgeGained}
              </p>
            </div>

            {/* Example Test Cases */}
            <div className="mt-4">
              <h3
                className={`font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                Example Test Cases
              </h3>
              {problemData.exampleTestCases &&
              problemData.exampleTestCases.length > 0 ? (
                problemData.exampleTestCases.map((testCase, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="mb-2">
                      <strong
                        className={`${
                          isDarkMode ? "text-white" : "text-black"
                        }`}
                      >
                        Input:
                      </strong>
                      <pre
                        className={`p-2 rounded ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {testCase.input}
                      </pre>
                    </div>
                    <div className="mb-2">
                      <strong
                        className={`${
                          isDarkMode ? "text-white" : "text-black"
                        }`}
                      >
                        Expected Output:
                      </strong>
                      <pre
                        className={`p-2 rounded ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`${isDarkMode ? "text-white" : "text-black"}`}>
                  No example test cases available
                </p>
              )}
            </div>
          </div>
        </Panel>

        {/* Code Editor Panel */}
        <PanelResizeHandle />
        {/* Code Editor and Output Section */}

        <Panel
          defaultSize={60}
          minSize={30}
          maxSize={70}
          className={`overflow-hidden ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
          }`}
        >
          <PanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <Panel defaultSize={80} minSize={50} className="h-full">
              <Editor
                height="100%"
                theme={isDarkMode ? "vs-dark" : "vs-light"}
                value={code}
                language={language}
                onChange={handleCodeChange}
                options={{
                  wordWrap: "on",
                  wrappingIndent: "same",
                  fontSize: 16,
                }}
              />
            </Panel>

            {/* Output and Test Cases Area */}
            <PanelResizeHandle />
            <Panel
              defaultSize={20}
              minSize={20}
              className={`p-2 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
            >
              <div className="h-full overflow-auto">
                <h3 className="text-lg font-bold mb-2">Execution Results</h3>

                {/* Overall Output */}
                <div className="mb-4">
                  <strong>Overall Output:</strong>
                  <pre
                    className={`p-2 rounded ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    {isRunning ? "Running..." : output}
                  </pre>
                </div>

                {/* Qubits Information */}
                {qubits > 0 && (
                  <div className="mb-4">
                    <strong>Qubits Used:</strong>
                    <span
                      className={`ml-2 p-1 rounded ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      {qubits}
                    </span>
                  </div>
                )}

                {/* Test Cases Table */}
                {testCaseResults.length > 0 && (
                  <div className="w-full">
                    <table
                      className={`w-full border-collapse ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      <thead>
                        <tr
                          className={`${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <th className="border p-2">Input</th>
                          <th className="border p-2">Expected Output</th>
                          <th className="border p-2">Actual Output</th>
                          <th className="border p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCaseResults.map((testCase, index) => (
                          <tr
                            key={index}
                            className={`
                            ${
                              testCase.pass
                                ? isDarkMode
                                  ? "bg-green-900"
                                  : "bg-green-100"
                                : isDarkMode
                                ? "bg-red-900"
                                : "bg-red-100"
                            } hover:${
                              isDarkMode ? "bg-gray-700" : "bg-gray-200"
                            }
                          `}
                          >
                            <td className="border p-2">{testCase.input}</td>
                            <td className="border p-2">
                              {testCase.expectedOutput}
                            </td>
                            <td className="border p-2">
                              {testCase.actualOutput}
                            </td>
                            <td className="border p-2 font-bold">
                              {testCase.pass ? "✓ Passed" : "✗ Failed"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default CodingPlatform;
