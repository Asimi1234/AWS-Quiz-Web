import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE;
const secretCode = process.env.REACT_APP_CODE;

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const maxAttempts = 60;
  const attemptsLeft = isAdmin
    ? maxAttempts - 1
    : Math.max(maxAttempts - attempts, 0);

  useEffect(() => {
    const attemptsKey = `attempts-${courseId}`;
    const savedAttempts = parseInt(localStorage.getItem(attemptsKey)) || 0;
    setAttempts(savedAttempts);

    if (savedAttempts >= maxAttempts && !isAdmin) {
      setShowAdminDialog(true);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/start-quiz?courseId=${courseId}`)
      .then((res) => {
        setQuestions(res.data.questions);
        setScore(0);
        setAnswers({});
        setCompleted(false);
        setTimeLeft(300);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load quiz.");
        setLoading(false);
      });
  }, [courseId, isAdmin]);

  const handleAdminSubmit = () => {
    if (adminInput === secretCode) {
      const attemptsKey = `attempts-${courseId}`;
      localStorage.setItem(attemptsKey, 1);
      setAttempts(1);
      setIsAdmin(true);
      setShowAdminDialog(false);
      setAdminError("");

      setLoading(true);
      axios
        .get(`${API_BASE}/start-quiz?courseId=${courseId}`)
        .then((res) => {
          setQuestions(res.data.questions);
          setScore(0);
          setAnswers({});
          setCompleted(false);
          setTimeLeft(300);
          setLoading(false);
        })
        .catch(() => {
          alert("Failed to load quiz.");
          setLoading(false);
        });
    } else {
      setAdminError("Incorrect admin code.");
    }
  };

  const handleFinalSubmit = useCallback(() => {
    axios
      .get(`${API_BASE}/get-answer?courseId=${courseId}`)
      .then((res) => {
        const corrects = res.data.correct_answers;
        setCorrectAnswers(corrects);

        let finalScore = 0;
        for (const qId in corrects) {
          if (answers[qId]?.answer === corrects[qId]) finalScore++;
        }
        setScore(finalScore);
        setCompleted(true);

        if (!isAdmin) {
          const attemptsKey = `attempts-${courseId}`;
          const savedAttempts =
            parseInt(localStorage.getItem(attemptsKey)) || 0;
          const newAttempts = savedAttempts + 1;
          localStorage.setItem(attemptsKey, newAttempts);
          setAttempts(newAttempts);
        }
      })
      .catch(() => {
        alert("Unable to fetch correct answers.");
      });
  }, [courseId, answers, isAdmin]);

  useEffect(() => {
    if (loading || completed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, completed, handleFinalSubmit]);

  const handleAnswer = (questionId, answer) => {
    axios
      .post(`${API_BASE}/submit-answer`, {
        question_id: questionId,
        answer,
        courseId: courseId,
      })
      .then((res) => {
        const isCorrect = res.data.correct;
        setAnswers((prev) => ({
          ...prev,
          [questionId]: { answer, correct: isCorrect },
        }));
      })
      .catch(() => {
        alert("Failed to submit answer.");
      });
  };

  const handleNext = () => {
    if (current + 1 < questions.length) setCurrent(current + 1);
  };
  const handlePrevious = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);
  const confirmSubmit = () => {
    setConfirmOpen(false);
    handleFinalSubmit();
  };

  const q = questions[current];

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 5, color: "white" }}>Loading...</Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        color: "white",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        {completed ? (
          <Card
            elevation={5}
            sx={{ p: 3, borderRadius: 3, background: "#fff" }}
          >
            <CardContent>
              <Typography variant="h4" gutterBottom color="primary">
                Quiz Complete!
              </Typography>
              <Typography variant="h6">
                Score: {score} / {questions.length}
              </Typography>
              <Box mt={3}>
                {questions.map((q, idx) => (
                  <Box key={q.questionId} mt={2}>
                    <Typography variant="subtitle2">
                      {idx + 1}. {q.question}
                    </Typography>
                    <Typography variant="body2" color="green">
                      Correct: {correctAnswers[q.questionId]}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={answers[q.questionId]?.correct ? "blue" : "red"}
                    >
                      Your Answer:{" "}
                      {answers[q.questionId]?.answer || "Not answered"}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box mt={4} textAlign="center">
                <Button
                  variant="contained"
                  onClick={() => navigate("/")}
                  sx={{ px: 4, py: 1, backgroundColor: "#0F4C75" }}
                >
                  Back
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{ textAlign: "center", fontWeight: "bold", mb: 4 }}
            >
              {courseId.toUpperCase()}
            </Typography>
            <Box
              sx={{
                backgroundColor: attemptsLeft <= 5 ? "#ffcccb" : "#3a6f85",
                border: "0.3px solid #ccc",
                color: "whitesmoke",
                borderRadius: 2,
                p: 1,
                mb: 2,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {isAdmin ? (
                <>
                  Admin Mode: You have {attemptsLeft} free{" "}
                  {attemptsLeft === 1 ? "attempt" : "attempts"} left.
                </>
              ) : (
                <>
                  You have {attemptsLeft} free{" "}
                  {attemptsLeft === 1 ? "attempt" : "attempts"} left.
                </>
              )}
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <TimerIcon />
              <Typography>
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </Typography>
            </Stack>
            <Typography variant="body2" mt={1} mb={1} textAlign="center">
              Answered: {Object.keys(answers).length} / {questions.length}
            </Typography>
            <Grid container spacing={1} mb={3} justifyContent="center">
              {questions.map((q, idx) => (
                <Grid item xs={1} key={q.questionId}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: answers[q.questionId]
                        ? "#64b5f6"
                        : "#ccc",
                      color: "#000",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    onClick={() => setCurrent(idx)}
                  >
                    {idx + 1}
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Card elevation={5} sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Question {current + 1} of {questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {q?.question}
                </Typography>
                <Stack spacing={2}>
                  {q?.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="contained"
                      onClick={() => handleAnswer(q.questionId, opt)}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </Button>
                  ))}
                </Stack>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  mt={3}
                >
                  <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={current === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleNext}
                    disabled={current === questions.length - 1}
                  >
                    Next
                  </Button>
                </Stack>
                <Box mt={3} textAlign="center">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleOpenConfirm}
                    sx={{ px: 4, py: 1 }}
                  >
                    Submit Quiz
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
          <DialogTitle>Submit Quiz</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to submit?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm}>No</Button>
            <Button onClick={confirmSubmit} color="error">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showAdminDialog}>
          <DialogTitle>Maximum Attempts Reached</DialogTitle>
          <DialogContent>
            <Typography>
              You have reached the maximum number of attempts for this quiz.
            </Typography>
            <Typography>Enter admin override code to continue:</Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Admin Code"
              fullWidth
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              error={!!adminError}
              helperText={adminError}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdminSubmit();
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate("/")}>Cancel</Button>
            <Button onClick={handleAdminSubmit} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Quiz;
