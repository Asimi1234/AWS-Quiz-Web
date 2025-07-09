import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import RequestPasswordResetPage from "./components/RequestPasswordResetPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import CourseSelection from "./components/CourseSelection";
import Quiz from "./components/Quiz";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Component to handle root redirect logic
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const hasAccount = localStorage.getItem("hasAccount") === "true";

  if (token) {
    return <Navigate to="/courses" replace />;
  } else if (hasAccount) {
    return <Navigate to="/login" replace />;
  } else {
    return <Navigate to="/signup" replace />;
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Root route with logic */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <CourseSelection />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz/:courseId"
          element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          }
        />

        {/* Catch-all unknown routes */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Router>
  );
};

export default App;
