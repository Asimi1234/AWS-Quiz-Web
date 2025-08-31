import React, { useState, useEffect } from "react";
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
  IconButton,
  Stack,
  Avatar,
  Fade,
  Chip,
  Tooltip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TimerIcon from "@mui/icons-material/Timer";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import QuizIcon from "@mui/icons-material/Quiz";
import LeaderboardModal from "../components/LeaderboardModal";
import WithSidebarLayout from "../layouts/WithSidebarLayout";

const courses = [
  { id: "OOU-PHY", name: "General Physics PQ", questions: 25, duration: "5 min", color: "#568d83ff" },
  { id: "OOU-CHM", name: "General Chemistry PQ", questions: 25, duration: "5 min", color: "#dcbc52ff" },
  { id: "OOU-BIO", name: "General Biology PQ", questions: 25, duration: "5 min", color: "#74765eff" },
  { id: "OOU-ENG", name: "English PQ", questions: 25, duration: "5 min", color: "#025e3fff" },
  { id: "OOU-GLK", name: "General Knowledge PQ", questions: 25, duration: "5 min", color: "#065cb3ff" },
  { id: "GST112", name: "Nigerian Peoples and Culture", questions: 25, duration: "5 min", color: "#3b4cca" }, 
  { id: "GET102", name: "Engineering Graphics and Solid Modelling I", questions: 25, duration: "5 min", color: "#553c9a" },
  { id: "CHM102", name: "General Chemistry II", questions: 25, duration: "5 min", color: "#6a0572" }, 
  { id: "PHY003", name: "Magnetism and Electromagnetism", questions: 25, duration: "5 min", color: "#8a1c1c" },
  { id: "PHY004", name: "Nuclear Physics and Radioactivity", questions: 25, duration: "5 min", color: "#264653" },
  { id: "CRS101", name: "Introduction to Christian Religious Studies", questions: 25, duration: "5 min", color: "#2a9d8f" },
  { id: "MTH204", name: "Calculus and Mathematical Analysis", questions: 25, duration: "5 min", color: "#3b4cca" },
  { id: "LAW106", name: "Introduction to Nigerian Law", questions: 25, duration: "5 min", color: "#553c9a" }, 
  { id: "ECON108", name: "Principles of Economics", questions: 25, duration: "5 min", color: "#6a0572" },
  { id: "MCB103", name: "General Microbiology I", questions: 25, duration: "5 min", color: "#8a1c1c" }, 
  { id: "PHY103", name: "General Physics I", questions: 25, duration: "5 min", color: "#264653" }, 
  
];

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isTokenExpired = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return true;
    const [, payloadBase64] = token.split(".");
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const CourseSelection = () => {
  const navigate = useNavigate();
  const [loadingCourse, setLoadingCourse] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    if (isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      toast.error("Session expired. Please login again.");
      navigate("/login");
    }
  }, [navigate]);

  const handleSelectCourse = async (courseId) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isAdmin = localStorage.getItem(`isAdmin-${courseId}`) === "true";

    if (!token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    setLoadingCourse(courseId);
    try {
      let url = `${API_BASE_URL}/check-attempts?course_id=${encodeURIComponent(courseId)}&is_admin=${isAdmin}`;
      if (isAdmin && userId) url += `&user_id=${encodeURIComponent(userId)}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });

      if (response.data.success && response.data.remaining_attempts > 0) {
        toast.success(`Starting quiz! You have ${response.data.remaining_attempts} attempts remaining.`);
        setTimeout(() => navigate(`/quiz/${courseId}`), 1200);
      } else {
        toast.error(response.data.message || "No attempts remaining for this quiz.");
        setLoadingCourse(null);
      }
    } catch (error) {
      setLoadingCourse(null);
      toast.error(error.response?.data?.message || "Error checking attempts.");
    }
  };

  const handleLeaderboardOpen = async (courseId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/leaderboard?course_id=${encodeURIComponent(courseId)}`,
        { headers: getAuthHeaders() }
      );
      setLeaderboardData(response.data.leaderboard);
      setSelectedCourseId(courseId);
      setLeaderboardOpen(true);
    } catch {
      toast.error("Failed to load leaderboard.");
    }
  };

  const getCardWidth = () => (isMobile ? "100%" : isTablet ? 320 : 360);
  const getCardHeight = () => (isMobile ? 280 : 300);

  return (
    <WithSidebarLayout>
  <Box
    sx={{
      minHeight: "calc(100vh - 64px)",
      backgroundColor: "#f5f7fa",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Container sx={{ py: 6, position: "relative", zIndex: 1 }}>
      <Fade in timeout={600}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              backgroundColor: "primary.main",
            }}
          >
            <QuizIcon sx={{ fontSize: 40, color: "white" }} />
          </Avatar>
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" mb={2}>
            Choose Your Course
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Select a course to begin your quiz journey. Each quiz contains 25 questions with a 5-minute time limit.
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={800}>
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3} sx={{ mb: 6 }}>
          {courses.map((course, index) => (
            <Fade in timeout={800 + index * 100} key={course.id}>
              <Card
                sx={{
                  width: getCardWidth(),
                  height: getCardHeight(),
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: course.color,
                        mr: 2,
                      }}
                    >
                      <SchoolIcon sx={{ color: "white", fontSize: 24 }} />
                    </Avatar>
                    <Chip label={course.id} size="small" sx={{ color: course.color }} />
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ height: isMobile ? "auto" : 60 }}>
                    {course.name}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center">
                      <QuestionAnswerIcon sx={{ fontSize: 18, color: course.color, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.questions} Questions
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <TimerIcon sx={{ fontSize: 18, color: course.color, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loadingCourse === course.id ? null : <PlayArrowIcon />}
                    onClick={() => handleSelectCourse(course.id)}
                    disabled={!!loadingCourse}
                  >
                    {loadingCourse === course.id ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Start Quiz"}
                  </Button>

                  <Tooltip title="View Leaderboard" arrow>
                    <IconButton onClick={() => handleLeaderboardOpen(course.id)} sx={{ ml: 1, color: course.color }}>
                      <LeaderboardIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>

                {loadingCourse === course.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                    }}
                  >
                    <CircularProgress size={40} sx={{ color: course.color, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      Preparing your quiz...
                    </Typography>
                  </Box>
                )}
              </Card>
            </Fade>
          ))}
        </Box>
      </Fade>

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboard={leaderboardData}
        courseId={selectedCourseId}
      />
    </Container>
  </Box>
</WithSidebarLayout>

  );
};

export default CourseSelection;