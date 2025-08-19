import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Paper,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import WithSidebarLayout from "../layouts/WithSidebarLayout";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const EditQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get("courseId");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/user/get-quiz?quizId=${quizId}&courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.success) throw new Error("Failed to fetch quiz");

        setQuizData(res.data.quiz);
      } catch (err) {
        toast.error("Failed to load quiz");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, courseId, navigate]);

  const handleSave = async () => {
    if (!quizData.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE_URL}/user/update-quiz`,
        {
          quizId,
          title: quizData.title,
          questions: quizData.questions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Quiz updated successfully");
        navigate("/my-quizzes");
      } else {
        toast.error(res.data.message || "Failed to update quiz");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...quizData.questions];
    updated[index][field] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...quizData.questions];
    updated[qIndex].options[optIndex] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const addQuestion = () => {
    const newQuestion = {
      text: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
    };
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, newQuestion],}));
  };

  const deleteQuestion = (index) => {
    const updated = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updated });
  };

  if (loading) {
    return (
      <WithSidebarLayout>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading quiz...</Typography>
          </Box>
        </Container>
      </WithSidebarLayout>
    );
  }

  return (
    <WithSidebarLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        
        {/* Simple Header */}
        <Typography variant="h4" sx={{ mb: 3 }}>
          Edit Quiz
        </Typography>

        {/* Quiz Title */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Quiz Title</Typography>
          <TextField
            label="Enter quiz title"
            fullWidth
            value={quizData.title}
            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
            variant="outlined"
          />
        </Paper>

        {/* Questions List */}
        {quizData.questions.map((q, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #ddd" }}>
            
            {/* Question Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Question {index + 1}</Typography>
              <IconButton onClick={() => deleteQuestion(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>

            {/* Question Text */}
            <TextField
              fullWidth
              label="Question"
              multiline
              rows={2}
              value={q.text}
              onChange={(e) => updateQuestionField(index, "text", e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Options */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              Options:
            </Typography>
            
            {q.options.map((opt, i) => (
              <TextField
                key={i}
                fullWidth
                label={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(index, i, e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                  style: {
                    backgroundColor: i === q.correctOptionIndex ? "#e8f5e8" : "white"
                  }
                }}
              />
            ))}

            {/* Correct Answer */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={q.correctOptionIndex}
                label="Correct Answer"
                onChange={(e) => updateQuestionField(index, "correctOptionIndex", parseInt(e.target.value))}
              >
                {q.options.map((option, i) => (
                  <MenuItem key={i} value={i}>
                    Option {i + 1}: {option || "(Empty)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        ))}

        {/* Bottom Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
          >
            Add Question
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            color="primary"
          >
            {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </Box>

      </Container>
    </WithSidebarLayout>
  );
};

export default EditQuizPage;