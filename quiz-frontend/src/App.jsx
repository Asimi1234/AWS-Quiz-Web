import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CourseSelection from './components/CourseSelection';
import Quiz from './components/Quiz';

const App = () => {
  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      const newId = "user_" + Date.now();
      localStorage.setItem("userId", newId);
    }
  }, []);
  return (
    <Router>
      <Routes>
        {/* Default route: redirect to /select-course */}
        <Route path="/" element={<Navigate to="/select-course" />} />

        {/* Course selection page */}
        <Route path="/select-course" element={<CourseSelection />} />

        {/* Quiz page with courseId param */}
        <Route path="/quiz/:courseId" element={<Quiz />} />
      </Routes>

      {/* Toast notifications container */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Router>
  );
};

export default App;

