import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Button,
  Box, LinearProgress, Stack, useMediaQuery, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';


const API_BASE = process.env.REACT_APP_API_BASE;

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:450px)");

  useEffect(() => {
    axios.get(`${API_BASE}/start-quiz`)
      .then(res => {
        setQuestions(res.data.questions);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || completed) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, completed]);

  const handleAnswer = (questionId, answer) => {
    axios.post(`${API_BASE}/submit-answer`, { question_id: questionId, answer })
      .then(res => {
        setAnswers(prev => ({ ...prev, [questionId]: { answer, correct: res.data.correct } }));
        if (res.data.correct) setScore(score + 1);
      })
      .catch(err => {
    console.error("Error submitting answer:", err);
  });
  };

  const handleFinalSubmit = () => {
    axios.get(`${API_BASE}/get-answer`)
      .then(res => {
        setCorrectAnswers(res.data.correct_answers);
        setCompleted(true);
      })
      .catch(err => {
        console.error("Error fetching correct answers:", err);
        alert("Unable to fetch correct answers.");
      });
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);

  const confirmSubmit = () => {
    setConfirmOpen(false);
    handleFinalSubmit();
  };

  if (loading) return <LinearProgress />;

  if (completed) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h6">
              Your score: {score} / {questions.length}
            </Typography>
            <Typography variant="body1" mt={2}>
              Time used: {Math.floor((300 - timeLeft) / 60)}:{String((300 - timeLeft) % 60).padStart(2, '0')}
            </Typography>

            <Box mt={3}>
              <Typography variant="h6">Correct Answers:</Typography>
              {questions.map((q, idx) => (
                <Box key={q.questionId} mt={1}>
                  <Typography variant="subtitle2">{idx + 1}. {q.question}</Typography>
                  <Typography variant="body2" color="green">
                    Correct: {correctAnswers[q.questionId]}
                  </Typography>
                  <Typography variant="body2" color={answers[q.questionId]?.correct ? "blue" : "red"}>
                    Your Answer: {answers[q.questionId]?.answer || "Not answered"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const q = questions[current];
  const userAnswer = answers[q.questionId]?.answer;

  return (
    <Container maxWidth="sm" sx={{ mt: isMobile ? 8 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: isMobile ? 4 : 1 }}>
        GST 112
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Question {current + 1} of {questions.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {q.question}
          </Typography>

          <Stack spacing={2}>
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant="contained"
                color={userAnswer === opt ? "primary" : "inherit"}
                onClick={() => handleAnswer(q.questionId, opt)}
                sx={{ backgroundColor: userAnswer === opt ? '#0D47A1' : undefined }}
              >
                {opt}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button variant="outlined" onClick={handlePrevious} disabled={current === 0}>Previous</Button>
            <Button variant="contained" onClick={handleNext} disabled={current === questions.length - 1}>Next</Button>
          </Stack>

          <Box mt={3} textAlign="center">
            <Button variant="contained" color="error" onClick={handleOpenConfirm}>
              Submit Quiz
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box mt={2}>
        <LinearProgress variant="determinate" value={((current + 1) / questions.length) * 100} />
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </Typography>
      </Box>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Submit Quiz</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit your answers?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>No</Button>
          <Button onClick={confirmSubmit} color="error">Yes, Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Quiz;
