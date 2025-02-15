import React from "react";
import { Link } from "react-router-dom";

const DocumentationScroll = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white font-sans overflow-hidden">
      {/* Left Side - Sticky Navigation */}
      <div className="w-1/4 bg-gray-700 p-6 sticky top-0 h-screen overflow-y-auto border-r-2 border-gray-600">
        <Link to="/user/dashboard">
          <p className="text-yellow-500 text-bold text-lg">Home</p>
        </Link>
        <h2 className="text-3xl font-bold mb-6 text-yellow-400 font-medieval">
          Documentation
        </h2>
        <ul className="space-y-4">
          <li>
            <a
              href="#introduction"
              className="hover:text-yellow-400 text-lg font-semibold"
            >
              Introduction
            </a>
          </li>
          <li>
            <a
              href="#guilds"
              className="hover:text-yellow-400 text-lg font-semibold"
            >
              Guilds
            </a>
          </li>
          <li>
            <a
              href="#challenges"
              className="hover:text-yellow-400 text-lg font-semibold"
            >
              Challenges
            </a>
          </li>
          <li>
            <a
              href="#leaderboard"
              className="hover:text-yellow-400 text-lg font-semibold"
            >
              Leaderboard
            </a>
          </li>
          <li>
            <a
              href="#faq"
              className="hover:text-yellow-400 text-lg font-semibold"
            >
              FAQ
            </a>
          </li>
        </ul>
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="w-3/4 p-8 overflow-y-auto">
        {/* Introduction Section */}
        <section id="introduction" className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 font-medieval">
            Welcome to QuantumCode!
          </h2>
          <p className="text-lg mb-6 bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            QuantumCode is a competitive coding platform where guilds (teams)
            compete to solve challenges and climb the leaderboard. Join a guild,
            accept challenges, and work together to earn rewards and glory!
          </p>
          <p className="text-lg bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            Whether you're a beginner or a coding master, QuantumCode offers
            challenges for all skill levels. Let the coding battles begin!
          </p>
        </section>

        {/* Guilds Section */}
        <section id="guilds" className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 font-medieval">
            Guilds
          </h2>
          <p className="text-lg mb-6 bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            Guilds are teams of coders who work together to complete challenges.
            Each guild has a unique name, logo, and leaderboard ranking.
          </p>
          <ul className="list-disc list-inside text-lg bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            <li>Create or join a guild to start competing.</li>
            <li>Invite friends or recruit members to strengthen your guild.</li>
            <li>
              Guild members can collaborate on challenges and share resources.
            </li>
          </ul>
        </section>

        {/* Challenges Section */}
        <section id="challenges" className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 font-medieval">
            Challenges
          </h2>
          <p className="text-lg mb-6 bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            Challenges are coding problems that guilds must solve to earn points
            and rewards. Each challenge has a difficulty level and a time limit.
          </p>
          <ul className="list-disc list-inside text-lg bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            <li>Challenges range from easy to expert difficulty.</li>
            <li>
              Guild members must work together to solve the challenge before the
              time runs out.
            </li>
            <li>Completed challenges earn points for your guild.</li>
          </ul>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 font-medieval">
            Leaderboard
          </h2>
          <p className="text-lg mb-6 bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            The leaderboard ranks guilds based on their performance in
            challenges. Climb the ranks to become the top guild in QuantumCode!
          </p>
          <ul className="list-disc list-inside text-lg bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
            <li>Points are awarded for completing challenges.</li>
            <li>Bonus points are given for solving challenges quickly.</li>
            <li>Top guilds earn exclusive rewards and recognition.</li>
          </ul>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400 font-medieval">
            FAQ
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                How do I join a guild?
              </h3>
              <p className="text-lg">
                You can create your own guild or join an existing one from the
                guilds page.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                Can I switch guilds?
              </h3>
              <p className="text-lg">
                Yes, but you will lose any progress and rewards earned with your
                current guild.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg border-2 border-gray-600 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                How are challenges scored?
              </h3>
              <p className="text-lg">
                Challenges are scored based on completion time, code efficiency,
                and correctness.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentationScroll;
