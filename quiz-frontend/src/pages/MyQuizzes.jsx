import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  CircularProgress,
  IconButton,
  Container,
  Stack,
  Tooltip,
  Avatar,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import QuizIcon from "@mui/icons-material/Quiz";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import WithSidebarLayout from "../layouts/WithSidebarLayout";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return null;
      }
      return token;
    } catch (err) {
      console.error("Invalid token:", err.message);
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/user/get-quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        });

        if (response.data.success) {
          setQuizzes(response.data.quizzes || []);
        } else {
          toast.error("Failed to load quizzes.");
        }
      } catch (error) {
        console.error("Fetch quizzes error:", error.response?.data || error.message);
        toast.error("Error fetching quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []); // Clean dependency array

  const handleDelete = async (quizId, courseId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    setDeletingId(quizId);

    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/user/delete-quiz`,
        { quizId, courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.message === "Quiz deleted successfully") {
        toast.success("Quiz deleted.");
        setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
      } else {
        toast.error("Delete failed.");
      }
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);

      if (error.response?.status === 404) {
        toast.error("Quiz not found. It may have already been deleted.");
        setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
      } else if (
        error.response?.status === 403 ||
        error.response?.status === 401
      ) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Error deleting quiz.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (quizId, courseId) => {
    navigate(`/edit-quiz/${quizId}?courseId=${courseId}`);
  };

  const handleStartQuiz = (quizId, courseId) => {
    navigate(`/start-quiz/${courseId}/${quizId}`);
  };

  const handleCreateNew = () => navigate("/create-quiz");

  if (loading) {
    return (
      <WithSidebarLayout>
        <Box
          minHeight="100vh"
          py={4}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress size={48} />
        </Box>
      </WithSidebarLayout>
    );
  }

  return (
    <WithSidebarLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              bgcolor: "primary.main",
              mb: 2,
            }}
          >
            <QuizIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            My Quiz Collection
          </Typography>
          <Typography color="text.secondary">
            Manage and edit your quizzes.
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6">Quiz Dashboard</Typography>
                <Typography variant="body2" color="text.secondary">
                  You have created {quizzes.length} quiz
                  {quizzes.length !== 1 ? "zes" : ""}.
                </Typography>
              </Box>
              <Chip label={`${quizzes.length} Total`} color="primary" />
            </Stack>
          </CardContent>
        </Card>

        {quizzes.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <QuizIcon sx={{ fontSize: 60, mb: 2, color: "text.secondary" }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No Quizzes Yet!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Ready to create your first quiz?
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Create Your First Quiz
            </Button>
          </Paper>
        ) : (
          <>
            <Box textAlign="center" mb={4}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Create New Quiz
              </Button>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              }}
              gap={3}
            >
              {quizzes.map((quiz) => (
                <Card key={quiz.quizId} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Course:</strong> {quiz.courseId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Questions:</strong> {quiz.questionCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong>{" "}
                      {quiz.createdAt
                        ? new Date(quiz.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleEdit(quiz.quizId, quiz.courseId)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleStartQuiz(quiz.quizId, quiz.courseId)
                      }
                      sx={{ textTransform: "none", fontWeight: 500 }}
                    >
                      Start Quiz
                    </Button>

                    <Tooltip title="Delete">
                      <span>
                        <IconButton
                          onClick={() =>
                            handleDelete(quiz.quizId, quiz.courseId)
                          }
                          color="error"
                          disabled={deletingId === quiz.quizId}
                        >
                          {deletingId === quiz.quizId ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>
    </WithSidebarLayout>
  );
};

export default MyQuizzes;
