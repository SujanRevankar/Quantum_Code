import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Users, MessageSquare, Sword } from "lucide-react";

export default function CommunityChat() {
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [messages, setMessages] = useState([
    { user: "Admin", text: "Welcome to the Java Community Chat! ⚔️" },
  ]);
  const [input, setInput] = useState("");
  const [users] = useState(["Barbarian", "Archer", "Wizard", "P.E.K.K.A"]);
  const [challenges, setChallenges] = useState([
    { title: "Destroy 3 Towers", difficulty: "Easy" },
    { title: "Defeat a Level 10 Base", difficulty: "Hard" },
  ]);
  const [filter, setFilter] = useState("All");

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { user: "You", text: input }]);
      setInput("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white p-6">
      {/* User List & Connections */}
      <div className="w-1/4 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <Users /> Clan Members
        </h2>
        <ul className="mt-4 space-y-2">
          {users.map((user, index) => (
            <li
              key={index}
              className="flex justify-between p-2 bg-gray-700 rounded-lg"
            >
              {user}
              <button className="bg-yellow-500 px-2 py-1 rounded-lg text-black hover:bg-yellow-600">
                Connect
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="flex-1 mx-6 bg-gray-800 p-6 rounded-lg shadow-lg">
        <motion.h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
          <Sword /> {selectedLanguage} Community Chat
        </motion.h1>

        {/* Language Selection */}
        <div className="flex space-x-4 mt-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedLanguage === "Java" ? "bg-yellow-500" : "bg-gray-700"
            }`}
            onClick={() => setSelectedLanguage("Java")}
          >
            ☕ Java
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedLanguage === "Python" ? "bg-yellow-500" : "bg-gray-700"
            }`}
            onClick={() => setSelectedLanguage("Python")}
          >
            🐍 Python
          </button>
        </div>

        {/* Chat Box */}
        <div className="mt-4 bg-gray-700 p-4 h-[500px] rounded-lg overflow-y-auto">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`p-2 my-1 rounded-lg ${
                msg.user === "You" ? "bg-yellow-500 text-black" : "bg-gray-600"
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </motion.div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 p-2 rounded-l-lg bg-gray-600 text-white"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-yellow-500 p-3 rounded-r-lg hover:bg-yellow-600"
            onClick={sendMessage}
          >
            <Send className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="w-1/4 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <MessageSquare /> Challenges
        </h2>
        <select
          className="mt-2 p-2 rounded-lg bg-gray-700 text-white"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <ul className="mt-4 space-y-2">
          {challenges
            .filter((c) => filter === "All" || c.difficulty === filter)
            .map((challenge, index) => (
              <li key={index} className="p-2 bg-gray-700 rounded-lg">
                <strong>{challenge.title}</strong> ({challenge.difficulty})
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
