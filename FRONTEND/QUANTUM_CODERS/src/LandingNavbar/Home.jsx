import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStartCodingClick = () => {
    const isAuthenticated = localStorage.getItem("token"); // Assuming you store a token after login
    if (isAuthenticated) {
      navigate("/user/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="px-2 py-2">
        <div className="container mx-auto p-6 sm:p-8 rounded-lg shadow-2xl bg-purple-950 bg-opacity-95 text-gray-100">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Code Editor Container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center mb-6 lg:mb-0">
              <div className="bg-gray-900 p-4 rounded-lg w-full shadow-xl border border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <pre className="text-sm text-purple-300 font-mono">
                  <code>{`function attackStrategy(troops, spells) {
  // Your code here
  let maxDamage = 0;
  let optimalFormation = [];
    
  // Optimize troop deployment
  return { maxDamage, optimalFormation };
}`}</code>
                </pre>
              </div>
            </div>
            {/* Content Container */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
              <div className="bg-purple-900 p-6 sm:p-8 rounded-lg shadow-lg border-t-4 border-purple-400">
                <h1 className="font-extrabold text-3xl sm:text-5xl text-center text-purple-300">
                  Quantum Code
                </h1>
                <p className="text-lg sm:text-xl py-3 text-center text-purple-400">
                  Code. Compete. Conquer.
                </p>
              </div>
              <p className="mt-6 text-lg sm:text-2xl text-center text-gray-300 px-4 lg:px-0">
                Master coding through challenges
              </p>
              <div className="flex mt-6 gap-4">
                <button
                  className="w-48 h-12 bg-purple-600 rounded-xl text-white font-bold flex items-center justify-center hover:bg-purple-500 transition duration-300"
                  onClick={handleStartCodingClick}
                >
                  Start Coding
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Categories */}
        <div id="challenges" className="py-16 mt-5 bg-purple-900">
          <h2 className="text-3xl sm:text-4xl text-center font-bold mb-6 text-purple-300">
            Challenge Arenas
          </h2>
          <div className="container px-4 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Algorithm Battles",
                desc: "Master algorithmic problems with Clash-themed coding challenges",
                difficulty: "Easy-Hard",
              },
              {
                title: "Resource Management",
                desc: "Optimize resource allocation with efficient code solutions",
                difficulty: "Medium",
              },
              {
                title: "Battle Strategy",
                desc: "Implement battle logic and troop deployment algorithms",
                difficulty: "Hard",
              },
            ].map((challenge, index) => (
              <div
                key={index}
                className="bg-purple-950 p-6 rounded-lg shadow-lg border border-purple-500"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-purple-300">
                  {challenge.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-300">
                  {challenge.desc}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-800 rounded-full text-xs text-purple-200">
                    {challenge.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 mt-5  bg-purple-950">
          <h2 className="text-3xl sm:text-4xl text-center font-bold mb-6 text-purple-300">
            Platform Features
          </h2>
          <div className="container px-4 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Interactive IDE",
                desc: "Code and test your solutions in our fully-featured online IDE with syntax highlighting",
              },
              {
                title: "Real-time Testing",
                desc: "Test your code against multiple test cases instantly",
              },
              {
                title: "Leaderboards",
                desc: "Compete with others and climb the global rankings",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-purple-900 p-6 rounded-lg shadow-lg border border-purple-500"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-purple-300">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Section */}
        <div id="practice" className="py-16 mt-5  bg-purple-900">
          <h2 className="text-3xl sm:text-4xl text-center font-bold mb-6 text-purple-300">
            Practice Arena
          </h2>
          <div className="container px-4  mx-auto flex flex-col items-center">
            <div className="w-full max-w-4xl bg-purple-950 p-6 rounded-lg shadow-lg border border-purple-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Daily Challenges", count: "50+", tag: "New" },
                  { title: "Total Problems", count: "500+", tag: "Updated" },
                  { title: "Active Users", count: "10K+", tag: "Growing" },
                  { title: "Success Rate", count: "85%", tag: "Excellent" },
                ].map((stat, index) => (
                  <div key={index} className="p-4 bg-purple-900 rounded-lg">
                    <h3 className="text-purple-300 font-bold">{stat.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl text-white">{stat.count}</span>
                      <span className="px-2 py-1 bg-purple-700 rounded-full text-xs text-purple-200">
                        {stat.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="py-16 mt-5  bg-purple-950">
          <h2 className="text-3xl sm:text-4xl text-center font-bold mb-6 text-purple-300">
            Join The Community
          </h2>
          <div className="container px-4 mx-auto flex flex-col items-center">
            <form className="w-full max-w-md">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 mb-4 border rounded text-sm sm:text-base bg-purple-900 text-gray-100 border-purple-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 mb-4 border rounded text-sm sm:text-base bg-purple-900 text-gray-100 border-purple-500"
              />
              <select className="w-full p-2 mb-4 border rounded text-sm sm:text-base bg-purple-900 text-gray-100 border-purple-500">
                <option value="">Select Your Programming Language</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-500 transition duration-300 text-sm sm:text-base font-bold">
                Start Your Journey
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
