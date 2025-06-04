// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CourseSelection from './components/CourseSelection';
import Quiz from './components/Quiz';

const App = () => {
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
    </Router>
  );
};

export default App;
