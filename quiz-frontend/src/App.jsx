import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./components/Login";
import CourseSelection from "./components/CourseSelection";
import Quiz from "./components/Quiz";

// Route guard component
const RequireAuth = ({ children }) => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected CourseSelection */}
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <CourseSelection />
            </RequireAuth>
          }
        />

        {/* Protected Quiz */}
        <Route
          path="/quiz/:courseId"
          element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          }
        />

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Router>
  );
};

export default App;
