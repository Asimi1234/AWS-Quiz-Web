import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import your components
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import RequestPasswordResetPage from "./components/RequestPasswordResetPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import CourseSelection from "./components/CourseSelection";
import Quiz from "./components/Quiz";
import Dashboard from "./components/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import RequireAuth from "./components/RequireAuth";
import MyQuizzes from "./pages/MyQuizzes";
import EditQuizPage from "./pages/EditQuizPage";
import StartQuiz from "./pages/StartQuiz";



// Redirect logic based on localStorage
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const hasAccount = localStorage.getItem("hasAccount") === "true";

  if (token) {
    return <Navigate to="/login" replace />;  // Redirect to dashboard now
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
        {/* Public routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/courses" element={<CourseSelection />} />
          <Route path="/quiz/:courseId" element={<Quiz />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/edit-quiz/:quizId" element={<EditQuizPage />} />
          <Route path="/start-quiz/:courseId/:quizId" element={<StartQuiz />} />

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Router>
  );
};

export default App;
