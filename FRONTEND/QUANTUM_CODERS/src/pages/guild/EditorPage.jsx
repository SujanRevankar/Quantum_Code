import React, { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import {
  Play,
  Clock,
  AlertTriangle,
  X,
  Maximize,
  Minimize,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Custom Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const EditorPage = () => {
  const guildId = localStorage.getItem("guildId");
  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("profile"));

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [language, setLanguage] = useState("python");
  const [testStarted, setTestStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningType, setWarningType] = useState("");
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );
  const [testResults, setTestResults] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const checkTestStatus = () => {
      const endTime = localStorage.getItem("testEndTime");
      const hasStarted = localStorage.getItem("testStarted");

      if (endTime && hasStarted === "true") {
        const now = new Date().getTime();
        if (now < parseInt(endTime)) {
          setTestStarted(true);
          setShowStartModal(false);
        } else {
          endTest();
        }
      }
    };

    checkTestStatus();
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!question) {
        try {
          const response = await axios.get(
            `http://localhost:8001/api/v1/get/accept/problem/solve/${guildId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            setQuestion(response.data);
            if (!localStorage.getItem("testStarted")) {
              setShowStartModal(true);
            }
          } else {
            toast.error("Problem not found");
          }
        } catch (error) {
          console.error("Error fetching problem:", error);
          toast.error("Error fetching problem");
        }
      }
    };
    fetchProblem();
  }, [guildId, token, question]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);

      if (testStarted && !isFullscreenNow) {
        setFullscreenWarnings((prev) => {
          const newCount = prev + 1;
          if (newCount < 3) {
            setWarningType("fullscreen");
            setShowWarningModal(true);
          } else {
            endTest();
          }
          return newCount;
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [testStarted]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testStarted]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (testStarted) {
        window.history.pushState(null, null, window.location.pathname);
        setWarningCount((prev) => {
          const newCount = prev + 1;
          if (newCount < 3) {
            setWarningType("navigation");
            setShowWarningModal(true);
          } else {
            endTest();
          }
          return newCount;
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [testStarted]);

  useEffect(() => {
    let timer;
    if (testStarted) {
      timer = setInterval(updateTimeLeft, 1000);
      updateTimeLeft();
    }
    return () => clearInterval(timer);
  }, [testStarted]);

  useEffect(() => {
    if (testStarted && code) {
      localStorage.setItem("savedCode", code);
    }
  }, [code, testStarted]);

  const startTest = async () => {
    try {
      await axios.post(
        `http://localhost:8001/api/v1/add/time_limit/${guildId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const duration = question.timeLimit * 60 * 1000;
      const endTime = new Date().getTime() + duration;

      localStorage.setItem("testEndTime", endTime.toString());
      localStorage.setItem("testStarted", "true");

      setTestStarted(true);
      setShowStartModal(false);
      toggleFullscreen();
      toast.info("Test has started!");
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test");
    }
  };

  const updateTimeLeft = () => {
    const endTime = localStorage.getItem("testEndTime");
    if (endTime) {
      const now = new Date().getTime();
      const diff = parseInt(endTime) - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        endTest();
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      toast.error("Fullscreen mode is not supported by your browser");
    }
  };

  const endTest = async () => {
    setTestStarted(false);
    localStorage.removeItem("testEndTime");
    localStorage.removeItem("testStarted");
    localStorage.removeItem("savedCode");

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    await handleSubmit(true);
    toast.error("Test has ended!");
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (!testStarted && !forceSubmit) {
      toast.error("Please start the test first");
      return;
    }

    setIsSubmitting(true);
    setIsCompiling(true);
    setExecutionError(null);
    setTestResults(null);

    try {
      const response = await axios.post(
        "http://localhost:8001/api/v1/check/solution/to/problem",
        {
          guildId: question.guildId,
          guildname: profile.guildname,
          username: profile.username,
          code: code,
          language: language,
          testCases: question.exampleTestCaes,
          qubits: question.qubits,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        setExecutionError(response.data.error);
        toast.error("Execution error occurred");
      } else if (response.data.testCaseResults) {
        setTestResults(response.data.testCaseResults);
        const allPassed = response.data.testCaseResults.every(
          (test) => test.pass
        );
        if (allPassed) {
          toast.success("All test cases passed!");
        } else {
          toast.warning("Some test cases failed");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response?.status === 417) {
        setExecutionError("Time limit exceeded");
        toast.error("Time limit exceeded");
      } else if (error.response?.data?.error) {
        setExecutionError(error.response.data.error);
        toast.error(error.response.data.error);
      } else {
        setExecutionError("An unexpected error occurred");
        toast.error("Error submitting solution");
      }
    } finally {
      setIsSubmitting(false);
      setIsCompiling(false);
    }
  };

  if (!question) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  console.log(testResults);
  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Start Modal */}
      <Modal isOpen={showStartModal} onClose={() => {}}>
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">
            Welcome to the Coding Challenge
          </h2>
          <div className="space-y-4">
            <p className="font-semibold">Important Instructions:</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>
                You have {question.timeLimit} minutes to complete this challenge
              </li>
              <li>
                Do not navigate away from this page or use browser back button
              </li>
              <li>You will receive 3 warnings before the test auto-submits</li>
              <li>Your solution will be auto-submitted when time expires</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
          </div>
          <button
            onClick={startTest}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Start Test
          </button>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      >
        <div className="text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              <h2 className="text-xl font-bold">
                {warningType === "fullscreen"
                  ? "Fullscreen Exit Warning"
                  : "Navigation Warning"}
              </h2>
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <p>
            {warningType === "fullscreen"
              ? `Warning ${fullscreenWarnings}/3: Please keep the test in fullscreen mode.`
              : `Warning ${warningCount}/3: Please don't navigate away from the test.`}
          </p>
          <button
            onClick={() => setShowWarningModal(false)}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Continue Test
          </button>
        </div>
      </Modal>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          !testStarted ? "blur-md pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <h1 className="text-xl font-bold text-yellow-400">
            {question.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="font-mono">{timeLeft || "Not started"}</span>
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !testStarted}
              className={`flex items-center ${
                !testStarted
                  ? "bg-gray-600"
                  : isSubmitting
                  ? "bg-gray-600"
                  : "bg-green-600 hover:bg-green-700"
              } px-4 py-2 rounded-lg`}
            >
              <Play className="mr-2 h-5 w-5" />
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <PanelGroup direction="horizontal" className="h-[calc(100vh-4rem)]">
          <Panel defaultSize={40} minSize={30} className="overflow-y-auto">
            <div className="p-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">
                    Problem Description
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">
                        Description
                      </h3>
                      <p className="mt-2">{question.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">
                        Input Format
                      </h3>
                      <p className="mt-2">{question.inputFormat}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">
                        Output Format
                      </h3>
                      <p className="mt-2">{question.outputFormat}</p>
                    </div>
                    {question.exampleTestCaes && (
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400">
                          Example Test Cases
                        </h3>
                        <div className="mt-2 space-y-2">
                          {question.exampleTestCaes.map((testCase, index) => (
                            <div
                              key={index}
                              className="bg-gray-700 p-3 rounded"
                            >
                              <div>
                                Input: <code>{testCase.input}</code>
                              </div>
                              <div>
                                Expected Output:{" "}
                                <code>{testCase.expectedOutput}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-gray-600" />

          <Panel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-4 bg-gray-800">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded"
                >
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                </select>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={language}
                  value={code}
                  onChange={setCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    wordWrap: "on",
                    readOnly: !testStarted,
                  }}
                />
              </div>
              {/* Test Cases Table */}
              <div className="h-[40%] overflow-auto bg-gray-800 p-4">
                {executionError ? (
                  <div className="bg-red-900 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="text-red-400" />
                      <h3 className="text-lg font-semibold">Execution Error</h3>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {executionError}
                    </pre>
                  </div>
                ) : testResults ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="text-green-400" />
                      Test Results
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-700">
                            <th className="border border-gray-600 p-2">
                              Test Case
                            </th>
                            <th className="border border-gray-600 p-2">
                              Input
                            </th>
                            <th className="border border-gray-600 p-2">
                              Expected Output
                            </th>
                            <th className="border border-gray-600 p-2">
                              Your Output
                            </th>
                            <th className="border border-gray-600 p-2">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.map((result, index) => (
                            <tr
                              key={index}
                              className={
                                result.pass
                                  ? "bg-green-900/50"
                                  : "bg-red-900/50"
                              }
                            >
                              <td className="border border-gray-600 p-2">
                                #{index + 1}
                              </td>
                              <td className="border border-gray-600 p-2 font-mono">
                                {result.input}
                              </td>
                              <td className="border border-gray-600 p-2 font-mono">
                                {result.expectedOutput}
                              </td>
                              <td className="border border-gray-600 p-2 font-mono">
                                {result.actualOutput}
                              </td>
                              <td className="border border-gray-600 p-2">
                                <span
                                  className={`flex items-center gap-2 justify-center ${
                                    result.pass
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {result.pass ? (
                                    <>
                                      <CheckCircle2 size={16} /> Passed
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={16} /> Failed
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    Submit your solution to see test results
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditorPage;
