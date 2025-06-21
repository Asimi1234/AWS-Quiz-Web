import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

// List of available courses
const courses = [
  {
    id: "GST112",
    name: "Nigerian Peoples and Culture",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "GET102",
    name: "Engineering Graphics and Solid Modelling I",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "CHM102",
    name: "General Chemistry II",
    questions: 25,
    duration: "5 min",
  },
];

// API base URL — replace with your live API Gateway URL
const API_BASE_URL = process.env.REACT_APP_API_BASE;

const CourseSelection = () => {
  const navigate = useNavigate();
  const [loadingCourse, setLoadingCourse] = useState(null);
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Handle course selection and check attempts
  // Handle course selection and check attempts
  const handleSelectCourse = async (courseId) => {
    setLoadingCourse(courseId);
    try {
      const userId = localStorage.getItem("userId") || "testUser";

      // Check attempts WITHOUT incrementing using the new check-attempts endpoint
      const response = await axios.get(
        `${API_BASE_URL}/check-attempts?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(courseId)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("🔍 API Response:", response.data); // Debug log

      // Check if user can attempt the quiz - fix the condition
      if (response.data.success && response.data.remaining_attempts > 0) {
        const remainingAttempts = response.data.remaining_attempts;
        toast.success(`Starting quiz! You have ${remainingAttempts} attempts remaining.`);

        // Navigate to quiz page - attempts will be incremented when quiz is actually submitted
        setTimeout(() => {
          navigate(`/quiz/${courseId}`);
        }, 1200);
      } else {
        navigate(`/quiz/${courseId}`);
      }

    } catch (error) {
      console.error("Error checking attempts:", error);

      // Handle different error scenarios
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 403) {
          toast.error("You have reached the maximum attempts for this course.");
        } else if (status === 400) {
          toast.error("Invalid request. Please try again.");
        } else {
          toast.error(errorData.message || "Failed to check quiz attempts. Please try again later.");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      setLoadingCourse(null);
    }
  };

  const getCardWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return 280;
    return 320;
  };

  const getCardHeight = () => {
    if (isMobile) return 250;
    return 260;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        color: "white",
      }}
    >
      {/* Header */}
      <Container sx={{ py: 7 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={8}>
          <Box
            component="img"
            src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
            alt="Company Logo"
            sx={{ height: 50, width: 50, mr: 2 }}
          />
          <Typography variant="h5" fontWeight="bold">
            IzyQuiz Lite
          </Typography>
        </Box>

        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 5 }}
        >
          Select a Course to Start Quiz
        </Typography>
      </Container>

      {/* Courses */}
      <Container sx={{ flex: 1 }}>
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={5}
          sx={{ mb: 7 }}
        >
          {courses.map((course) => (
            <Card
              key={course.id}
              sx={{
                width: getCardWidth(),
                height: getCardHeight(),
                maxWidth: 320,
                borderRadius: 3,
                backgroundColor: "#ffffffdd",
                color: "#000",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon sx={{ fontSize: 30, mr: 1, color: "#0f4c75" }} />
                  <Typography variant="h6" fontWeight="bold">
                    {course.id}
                  </Typography>
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: "0.95rem",
                    lineHeight: 1.3,
                    mb: 2,
                    minHeight: "40px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {course.name}
                </Typography>

                <Typography variant="body2" sx={{ mb: 0.5, lineHeight: "30px" }}>
                  <strong>Questions:</strong> {course.questions}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {course.duration}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: "#0f4c75" }}
                  onClick={() => handleSelectCourse(course.id)}
                  disabled={!!loadingCourse}
                >
                  {loadingCourse === course.id ? "Checking..." : "Start Quiz"}
                </Button>
              </CardActions>

              {loadingCourse === course.id && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.8)",
                    borderRadius: 3,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Card>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          color: "#ccc",
          backgroundColor: "#0f2027",
          opacity: 0.5,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Asimi Israel Ayomikun. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default CourseSelection;