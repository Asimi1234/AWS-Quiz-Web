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
  IconButton,
  Stack,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import LeaderboardModal from "../components/LeaderboardModal";
import UserAvatar from "../components/UseAvater";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";

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
  {
    id: "PHY003",
    name: "Magnetism and Electromagnetism",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "PHY004",
    name: "Nuclear Physics and Radioactivity",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "CRS101",
    name: "Introduction to Christian Religious Studies",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "MTH204",
    name: "Calculus and Mathematical Analysis",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "LAW106",
    name: "Introduction to Nigerian Law",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "ECON108",
    name: "Principles of Economics",
    questions: 25,
    duration: "5 min",
  },
  {
    id: "MCB103",
    name: "General Microbiology I",
    questions: 25,
    duration: "5 min",
  },
  { id: "PHY103", name: "General Physics I", questions: 25, duration: "5 min" },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

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
      // Build the API URL
      let url = `${API_BASE_URL}/check-attempts?course_id=${encodeURIComponent(
        courseId
      )}&is_admin=${isAdmin}`;
      if (isAdmin) {
        if (!userId) {
          toast.error("Missing user ID for admin check.");
          navigate("/login");
          return;
        }
        url += `&user_id=${encodeURIComponent(userId)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.remaining_attempts > 0) {
        toast.success(
          `Starting quiz! You have ${response.data.remaining_attempts} attempts remaining.`
        );
        setTimeout(() => navigate(`/quiz/${courseId}`), 1200);
      } else if (!response.data.success) {
        toast.error(
          `Error: ${response.data.message || "Could not fetch attempt info."}`
        );
        setLoadingCourse(null);
      } else {
        // Zero attempts left
        toast.error("No attempts remaining for this quiz.");
        setLoadingCourse(null);
      }
    } catch (error) {
      console.error("Error checking attempts:", error);
      toast.error("Failed to check quiz attempts. Please try again.");
      setLoadingCourse(null);
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
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      toast.error("Failed to load leaderboard.");
    }
  };

  const getCardWidth = () => (isMobile ? "100%" : isTablet ? 280 : 320);
  const getCardHeight = () => (isMobile ? 250 : 260);

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
      <Container sx={{ py: 7 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={8}
        >
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
              alt="Company Logo"
              sx={{ height: 50, width: 50, mr: 2 }}
            />
          </Box>

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: isMobile ? "1.6rem" : "2.4rem",
              textAlign: "center",
              flex: 1,
              ml: isMobile ? 0 : "-50px",
            }}
          >
            IzyQuiz Lite
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar userId={localStorage.getItem("userId")} />
            <IconButton
              aria-label="Logout"
              onClick={handleLogout}
              sx={{
                color: "#fff",
                border: "1px solid #fff",
                p: 1,
                "&:hover": { color: "#f44336", borderColor: "#f44336" },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
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
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, lineHeight: "30px" }}
                >
                  <strong>Questions:</strong> {course.questions}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {course.duration}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: "#0f4c75" }}
                  onClick={() => handleSelectCourse(course.id)}
                  disabled={!!loadingCourse}
                >
                  {loadingCourse === course.id ? "Checking..." : "Start Quiz"}
                </Button>
                <DashboardIcon
                  onClick={() => handleLeaderboardOpen(course.id)}
                  sx={{
                    fontSize: 26,
                    color: "#0f4c75",
                    cursor: "pointer",
                    ml: 1,
                    "&:hover": { color: "#3282b8" },
                  }}
                />
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

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboard={leaderboardData}
        courseId={selectedCourseId}
      />

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="LinkedIn profile"
              href="https://linkedin.com/in/asimiisrael"
              target="_blank"
              rel="noopener"
              sx={{ color: "#ccc" }}
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton
              aria-label="GitHub profile"
              href="https://github.com/Asimi1234"
              target="_blank"
              rel="noopener"
              sx={{ color: "#ccc" }}
            >
              <GitHubIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2">
            © {new Date().getFullYear()} Asimi Israel Ayomikun. All rights
            reserved.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default CourseSelection;
