import React, { useEffect, useState, useCallback } from "react";
import { Container, Box, CircularProgress, Typography, Button, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_BASE;
const secretCode = process.env.REACT_APP_CODE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const progressKey = `quiz-progress-${courseId}`;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [resumeChecked, setResumeChecked] = useState(false);

  const shuffleQuestions = (questions) =>
    questions
      .map((q) => ({
        ...q,
        options: q.options.sort(() => 0.5 - Math.random()),
      }))
      .sort(() => 0.5 - Math.random());

  const logoutAndRedirect = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  }, [navigate]);

  const fetchQuestions = useCallback(async () => {
    const url = `${API_BASE}/start-quiz?courseId=${courseId}`;
    
    try {
      const res = await fetch(url, {
        method: 'GET', 
        headers: getAuthHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please login again.");
        logoutAndRedirect();
        return;
      }

      if (!res.ok) {
        throw new Error(`Unexpected error: ${res.status}`);
      }

      const data = await res.json();
      setQuestions(shuffleQuestions(data.questions));
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load quiz. Please try again.");
    }
  }, [courseId, logoutAndRedirect]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { answer } }));
  };

  const handleFinalSubmit = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/get-answer?courseId=${courseId}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");

      const data = await res.json();
      const corrects = data.correct_answers;
      setCorrectAnswers(corrects);

      let finalScore = 0;
      for (const qId in corrects) {
        if (
          answers[qId]?.answer?.trim().toLowerCase() ===
          corrects[qId]?.trim().toLowerCase()
        ) {
          finalScore++;
        }
      }
      setScore(finalScore);
      setCompleted(true);

      const userId = localStorage.getItem("userId");
      if (!userId) return navigate("/login");

      await fetch(`${API_BASE}/submit-quiz`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          score: finalScore,
        }),
      });

      const attemptRes = await fetch(`${API_BASE}/user/attempts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
        }),
      });
      const attemptData = await attemptRes.json();
      setRemainingAttempts(attemptData.remaining_attempts);

      if (attemptData.remaining_attempts <= 0 && !isAdmin)
        setAdminDialogOpen(true);

      localStorage.removeItem(progressKey);
    } catch (err) {
      toast.error("Session expired or network error.");
      logoutAndRedirect();
    }
  }, [answers, courseId, isAdmin, navigate, progressKey, logoutAndRedirect]);

  const handleAdminSubmit = async () => {
    if (adminInput === secretCode) {
      localStorage.setItem(`isAdmin-${courseId}`, "true");
      setIsAdmin(true);
      setCompleted(false);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(300);
      setCorrectAnswers({});
      setScore(0);
      setAdminDialogOpen(false);
      setAdminError("");
      setLoading(true);
      fetchQuestions();

      const userId = localStorage.getItem("userId");
      if (!userId) return navigate("/login");

      try {
        const res = await fetch(
          `${API_BASE}/check-attempts?course_id=${courseId}&is_admin=true`,
          { headers: getAuthHeaders() }
        );
        const data = await res.json();
        setRemainingAttempts(data.remaining_attempts);
      } catch (err) {
        alert("Failed to update admin attempts.");
      }
    } else {
      setAdminError("Invalid code");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Effects remain the same
  useEffect(() => {
    const checkAttempts = async () => {
      const expired = isTokenExpired();
      
      if (expired) {
        toast.error("Session expired. Please login again.");
        logoutAndRedirect();
        return;
      }
    
      const savedAdmin = localStorage.getItem(`isAdmin-${courseId}`) === "true";
      setIsAdmin(savedAdmin);
    
      const userId = localStorage.getItem("userId");
      if (!userId) return navigate("/login");

      try {
        const res = await fetch(
          `${API_BASE}/check-attempts?course_id=${courseId}`,
          { headers: getAuthHeaders() }
        );

        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        if (data.success) {
          setRemainingAttempts(data.remaining_attempts);

          if (data.remaining_attempts <= 0 && !savedAdmin) {
            setAdminDialogOpen(true);
            setLoading(false);
            return;
          }

          const savedProgress = localStorage.getItem(progressKey);
          if (!resumeChecked && savedProgress) {
            const resume = window.confirm(
              "You have a saved quiz in progress. Resume?"
            );
            setResumeChecked(true);

            if (resume) {
              const parsed = JSON.parse(savedProgress);
              setQuestions(parsed.questions || []);
              setCurrent(parsed.current || 0);
              setAnswers(parsed.answers || {});
              setTimeLeft(parsed.timeLeft || 300);
              setLoading(false);
              return;
            } else {
              localStorage.removeItem(progressKey);
            }
          }
          fetchQuestions();
        } else {
          toast.error("Failed to check attempts: " + data.message);
          setLoading(false);
        }
      } catch (error) {
        toast.error("Session expired. Please log in again.");
        logoutAndRedirect();
      }
    };

    checkAttempts();
  }, [courseId, navigate, fetchQuestions, progressKey, resumeChecked, logoutAndRedirect]);

  useEffect(() => {
    if (!loading && !completed) {
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          current,
          answers,
          timeLeft,
          questions,
          startTime: Date.now(),
        })
      );
    }
  }, [current, answers, timeLeft, questions, loading, completed, progressKey]);

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

  useEffect(() => {
    setResumeChecked(false);
  }, [courseId]);

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" mt={10}>
          <CircularProgress />
          <Typography>Loading quiz...</Typography>
        </Box>
      </Container>
    );
  }

  if (completed) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" gutterBottom>Quiz Completed!</Typography>
          <Typography variant="h6">Your Score: {score} out of {questions.length}</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
            Percentage: {Math.round((score / questions.length) * 100)}%
          </Typography>
          
          <Typography variant="h6" gutterBottom>Review:</Typography>
          {questions.map((q, index) => {
            const userAnswer = answers[q._id]?.answer || "";
            const correctAnswer = correctAnswers[q._id] || "";
            const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
            
            return (
              <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #ddd" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {index + 1}. {q.text}
                </Typography>
                <Typography color={isCorrect ? "green" : "red"}>
                  Your answer: {userAnswer || "No answer"}
                </Typography>
                <Typography color="green">
                  Correct answer: {correctAnswer}
                </Typography>
              </Box>
            );
          })}
          
          <Button 
            variant="contained" 
            onClick={() => navigate("/courses")}
            sx={{ mt: 2 }}
          >
            Back to COURSE SELECTION
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = questions[current];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      
      {/* Basic Header Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Quiz</Typography>
          <Typography variant="body1">Time: {formatTime(timeLeft)}</Typography>
        </Box>
        <Typography variant="body2">
          Attempts left: {remainingAttempts} | 
          Progress: {Object.keys(answers).length}/{questions.length} answered
          {isAdmin && " (Admin Mode)"}
        </Typography>
      </Paper>

      {/* Current Question */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Question {current + 1} of {questions.length}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {currentQuestion?.text}
        </Typography>

        {/* Answer Options */}
        {currentQuestion?.options?.map((option, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Button
              variant={answers[currentQuestion._id]?.answer === option ? "contained" : "outlined"}
              fullWidth
              onClick={() => handleAnswer(currentQuestion._id, option)}
              sx={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Button>
          </Box>
        ))}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button 
          variant="outlined"
          onClick={() => setCurrent(Math.max(current - 1, 0))}
          disabled={current === 0}
        >
          Previous
        </Button>
        
        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          {current + 1} / {questions.length}
        </Typography>
        
        {current < questions.length - 1 ? (
          <Button 
            variant="outlined"
            onClick={() => setCurrent(Math.min(current + 1, questions.length - 1))}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setConfirmDialogOpen(true)}
          >
            Submit Quiz
          </Button>
        )}
      </Box>

      {/* Question Navigator */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Jump to question:</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={index === current ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrent(index)}
              sx={{
                minWidth: "40px",
                backgroundColor: answers[questions[index]._id] 
                  ? (index === current ? undefined : "#e8f5e8")
                  : undefined
              }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)}>
        <DialogTitle>Admin Access Required</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>No attempts remaining. Enter admin code:</Typography>
          <TextField
            fullWidth
            type="password"
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            error={!!adminError}
            helperText={adminError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button onClick={handleAdminSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit? You have answered {Object.keys(answers).length} out of {questions.length} questions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { setConfirmDialogOpen(false); handleFinalSubmit(); }} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Quiz;