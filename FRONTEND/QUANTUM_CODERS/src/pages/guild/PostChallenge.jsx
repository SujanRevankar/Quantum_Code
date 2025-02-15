import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Play } from "lucide-react";

const PostChallenge = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState({
    guildId: "",
    postedBy: "",
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    exampleTestCases: "",
    hiddenTestCases: "",
    solutions: "",
    timeLimit: "",
    qubits: "",
    code: "",
    testCases: "",
    language: "",
    guildName: "",
    constraints: [],
  });

  const [output, setOutput] = useState(null);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [isTestCasesPassed, setIsTestCasesPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChallenge((prev) => ({
      ...prev,
      [name]:
        name === "constraints"
          ? value
              .split(",")
              .map((constraint) => ({ constraint: constraint.trim() }))
          : value,
    }));
  };

  const handleEditorChange = (value) => {
    setChallenge((prev) => ({
      ...prev,
      code: value,
    }));
    // Reset test case validation when code changes
    setTestCaseResults([]);
    setIsTestCasesPassed(false);
    setOutput(null);
  };

  const handleRunTestCases = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8001/api/v1/check/questions",
        {
          code: challenge.code,
          language: challenge.language,
          guildName: challenge.guildName,
          testCases: JSON.parse(challenge.exampleTestCases),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const testResults = response.data.testCaseResults || [];
      setTestCaseResults(testResults);
      setOutput(response.data);

      const allTestCasesPassed = testResults.every((testCase) => testCase.pass);
      setIsTestCasesPassed(allTestCasesPassed);
      console.log(allTestCasesPassed);
      setIsTestCasesPassed(true);
      toast.success("Test cases run successfully!");
    } catch (error) {
      console.error("Error running test cases:", error);
      toast.error("Failed to run test cases");
      setTestCaseResults([]);
      setIsTestCasesPassed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isTestCasesPassed) {
      toast.error("Please pass all test cases first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const postData = {
        guildName: challenge.guildName,
        postedBy: challenge.postedBy,
        title: challenge.title,
        description: challenge.description,
        inputFormat: challenge.inputFormat,
        outputFormat: challenge.outputFormat,
        exampleTestCases: JSON.parse(challenge.exampleTestCases || "[]"),
        hiddenTestCases: JSON.parse(challenge.hiddenTestCases || "[]"),
        solutions: JSON.parse(challenge.solutions || "[]"),
        timeLimit: parseInt(challenge.timeLimit),
        qubits: parseInt(challenge.qubits),
      };

      const response = await axios.post(
        "http://localhost:8001/api/v1/post/question",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Challenge Created Successfully!");
    } catch (error) {
      if (error.response?.data === "InsufficientQUbits") {
        toast.error("Insufficient qubits for this challenge");
      } else {
        toast.error("Failed to create challenge");
      }
    }
  };

  console.log(challenge.code);
  console.log(challenge.exampleTestCases);
  console.log(challenge.hiddenTestCases);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <Link to={"/user/individual-challenges"}>
          <img src="/images/logo.png" className="h-12" alt="Logo" />
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRunTestCases}
            disabled={isLoading}
            className={`flex items-center ${
              isLoading ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            } px-4 py-2 rounded-lg text-white`}
          >
            <Play className="mr-2 h-5 w-5" />
            {isLoading ? "Running..." : "Run Test Cases"}
          </button>
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">
        {/* Challenge Details Panel */}
        <Panel
          defaultSize={40}
          minSize={30}
          maxSize={60}
          className="overflow-hidden bg-gray-800 text-white"
        >
          <div className="h-full overflow-y-auto p-4">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">
              Post a New Challenge
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                "guildName",
                "language",
                "postedBy",
                "title",
                "description",
                "inputFormat",
                "outputFormat",
                "timeLimit",
                "qubits",
              ].map((field) => (
                <label key={field} className="block">
                  <span className="text-gray-300">
                    {field.replace(/([A-Z])/g, " $1")}
                  </span>
                  <input
                    name={field}
                    value={challenge[field]}
                    onChange={handleChange}
                    className="w-full bg-gray-700 p-2 rounded text-white"
                  />
                </label>
              ))}

              {/* Example Test Cases */}
              <label className="block">
                <span className="text-gray-300">
                  Example Test Cases (JSON format)
                </span>
                <textarea
                  name="exampleTestCases"
                  value={challenge.exampleTestCases}
                  onChange={handleChange}
                  className="w-full bg-gray-700 p-2 rounded text-white"
                  placeholder='[{"input": "...", "expectedOutput": "..."}]'
                />
              </label>

              {/* Hidden Test Cases */}
              <label className="block">
                <span className="text-gray-300">
                  Hidden Test Cases (JSON format)
                </span>
                <textarea
                  name="hiddenTestCases" // Corrected name
                  value={challenge.hiddenTestCases}
                  onChange={handleChange}
                  className="w-full bg-gray-700 p-2 rounded text-white"
                  placeholder='[{"input": "...", "expectedOutput": "..."}]'
                />
              </label>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Submit Challenge</span>
              </button>
            </form>
          </div>
        </Panel>

        <PanelResizeHandle />

        {/* Code Editor Panel */}
        <Panel
          defaultSize={60}
          minSize={30}
          maxSize={70}
          className="overflow-hidden bg-gray-900 text-white"
        >
          <div className="h-full p-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">
              Code Editor
            </h2>
            <div className="h-full">
              <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={challenge.code}
                onChange={handleEditorChange}
                options={{
                  wordWrap: "on",
                  wrappingIndent: "same",
                  fontSize: 16,
                }}
              />
            </div>
            {/* Test Case Results */}
            {testCaseResults.length > 0 && (
              <div className="mt-4 bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">Test Case Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-700">
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
                          className={`${
                            testCase.pass ? "bg-green-900" : "bg-red-900"
                          } hover:bg-gray-700`}
                        >
                          <td className="border p-2">
                            {JSON.stringify(testCase.input)}
                          </td>
                          <td className="border p-2">
                            {JSON.stringify(testCase.expectedOutput)}
                          </td>
                          <td className="border p-2">
                            {JSON.stringify(testCase.actualOutput)}
                          </td>
                          <td className="border p-2 font-bold">
                            {testCase.pass ? "✓ Passed" : "✗ Failed"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {output?.outputAndQubits && (
                  <div className="mt-2 p-2 bg-gray-700 rounded">
                    <strong>Output and Qubits:</strong>
                    <pre className="mt-1 text-sm">
                      {JSON.stringify(output.outputAndQubits, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default PostChallenge;
