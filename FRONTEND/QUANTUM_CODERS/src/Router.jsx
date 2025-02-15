import App from "./App.jsx";
import Signup from "./Authentication/Signup.jsx";
import Login from "./Authentication/Login.jsx";
import Verification from "./Authentication/Verification.jsx";
import Reverification from "./Authentication/Reverification.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./Authentication/ForgotPassword.jsx";
import Questions from "./pages/questions/Questions.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import React from "react";
import QuestionPage from "./pages/questions/QuestionPage.jsx";
import GuildPage from "./pages/guild/GuildPage.jsx";
import LeaderBoardPage from "./pages/leaderboards/LeaderBoardPage.jsx";
import CommunityPage from "./pages/community/CommunityPage.jsx";
import Logout from "./Authentication/Logout.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import Scroll from "./pages/documentation/Scroll.jsx";
import PostChallenge from "./pages/guild/PostChallenge.jsx";
import QuestionList from "./pages/guild/GuildChallenges.jsx";
import SolveChallenge from "./pages/guild/SolveChallenge.jsx";
import EditorPage from "./pages/guild/EditorPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify",
    element: <Verification />,
  },
  {
    path: "/re-verify",
    element: <Reverification />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/user/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/user/profile",
    element: <Profile />,
  },
  {
    path: "/user/individual-challenges",
    element: <Questions />,
  },
  {
    path: "/user/individual-challenges/question/:language/:id", // Corrected dynamic route
    element: <QuestionPage />,
  },
  {
    path: "/user/guild-page/",
    element: <GuildPage />,
  },

  {
    path: "/user/leaderboards/",
    element: <LeaderBoardPage />,
  },
  {
    path: "/user/community/",
    element: <CommunityPage />,
  },
  {
    path: "/logout/",
    element: <Logout />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/user/documentation",
    element: <Scroll />,
  },
  {
    path: "/user/guild/post",
    element: <PostChallenge />,
  },
  {
    path: "/user/guild/challenges",
    element: <QuestionList />,
  },
  {
    path: "/user/guild/solve",
    element: <SolveChallenge />,
  },
  {
    path: "/user/guild/solve/editor",
    element: <EditorPage />,
  },
]);

export default router;
