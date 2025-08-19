import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  Stack,
  Avatar,
  Fade,
  Divider,
} from "@mui/material";
import { Add, Delete, Quiz } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import WithSidebarLayout from "../layouts/WithSidebarLayout";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !courseId ||
      questions.some(
        (q) => !q.question || q.options.some((opt) => !opt) || !q.correctAnswer
      )
    ) {
      toast.error("Please complete all fields.");
      return;
    }

    const payload = {
      courseId,
      title,
      questions,
    };

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/user/create-quiz`, payload, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      console.log("Quiz created:", response.data);
      toast.success("Quiz created successfully!");
      setTitle("");
      setCourseId("");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithSidebarLayout>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f9f9f9", py: 4 }}>
        <Fade in timeout={600}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                mx: "auto",
                mb: 2,
                backgroundColor: "#1976d2",
              }}
            >
              <Quiz fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={600} color="text.primary" mb={1}>
              Create New Quiz
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Enter quiz details and questions
            </Typography>
          </Box>
        </Fade>

        <Box maxWidth="lg" mx="auto" px={2}>
          <Fade in timeout={800}>
            <Card sx={{ mb: 4, borderRadius: 2, p: 3, boxShadow: "none", border: "1px solid #ccc" }}>
              <CardContent>
                <TextField
                  label="Course ID"
                  fullWidth
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Quiz Title"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 3 }}
                />
              </CardContent>
            </Card>
          </Fade>

          {questions.map((q, qIndex) => (
            <Fade key={qIndex} in timeout={1000 + qIndex * 200}>
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  border: "1px solid #ddd",
                  boxShadow: "none",
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Question {qIndex + 1}
                    </Typography>
                    <IconButton
                      onClick={() => removeQuestion(qIndex)}
                      sx={{
                        color: "#d32f2f",
                        "&:hover": {
                          backgroundColor: "#fce4ec",
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Question"
                    multiline
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Divider sx={{ mb: 3 }} />

                  <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" mb={2}>
                    Answer Options
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    {q.options.map((opt, i) => (
                      <TextField
                        key={i}
                        label={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                        fullWidth
                      />
                    ))}
                  </Box>

                  <TextField
                    label="Correct Answer (must match exactly)"
                    fullWidth
                    value={q.correctAnswer}
                    onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                  />
                </CardContent>
              </Card>
            </Fade>
          ))}

          <Fade in timeout={1500}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addQuestion}
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 500,
                  textTransform: "none",
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                  minWidth: { xs: "100%", sm: "200px" },
                }}
              >
                Add Question
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 500,
                  backgroundColor: "#1976d2",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                  minWidth: { xs: "100%", sm: "200px" },
                }}
              >
                {loading ? "Creating..." : "Create Quiz"}
              </Button>
            </Stack>
          </Fade>
        </Box>
      </Box>
    </WithSidebarLayout>
  );
};

export default CreateQuiz;
