import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Card, CardContent, Typography, Button,
  Box, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const API_BASE = process.env.REACT_APP_API_BASE;

const Quiz = () => {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(Number(localStorage.getItem('current')) || 0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(Number(localStorage.getItem('timeLeft')) || 300);
  const [answers, setAnswers] = useState(JSON.parse(localStorage.getItem('answers')) || {});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleFinalSubmit = useCallback(() => {
    axios.get(`${API_BASE}/get-answer?courseId=${courseId}`)
      .then(res => {
        const corrects = res.data.correct_answers;
        setCorrectAnswers(corrects);

        let finalScore = 0;
        for (const qId in corrects) {
          if (answers[qId]?.answer === corrects[qId]) {
            finalScore++;
          }
        }
        setScore(finalScore);
        setCompleted(true);
        localStorage.clear();
      })
      .catch(err => {
        console.error("Error fetching correct answers:", err);
        alert("Unable to fetch correct answers.");
      });
  }, [courseId, answers]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/start-quiz?courseId=${courseId}`)
      .then(res => {
        setQuestions(res.data.questions);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading quiz:", err);
        alert("Failed to load quiz.");
      });
  }, [courseId]);

  useEffect(() => {
    if (loading || completed) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const updated = prev - 1;
        localStorage.setItem('timeLeft', updated);
        if (updated <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, completed, handleFinalSubmit]);

  const handleAnswer = (questionId, answer) => {
    axios.post(`${API_BASE}/submit-answer`, {
      question_id: questionId,
      answer,
      courseId
    })
      .then(res => {
        const isCorrect = res.data.correct;
        const updatedAnswers = {
          ...answers,
          [questionId]: { answer, correct: isCorrect }
        };
        setAnswers(updatedAnswers);
        localStorage.setItem('answers', JSON.stringify(updatedAnswers));
      })
      .catch(err => {
        console.error("Error submitting answer:", err);
        alert("Failed to submit answer.");
      });
  };

  const handleNext = () => {
    const nextIndex = current + 1;
    if (nextIndex < questions.length) {
      setCurrent(nextIndex);
      localStorage.setItem('current', nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = current - 1;
    if (prevIndex >= 0) {
      setCurrent(prevIndex);
      localStorage.setItem('current', prevIndex);
    }
  };

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);
  const confirmSubmit = () => {
    setConfirmOpen(false);
    handleFinalSubmit();
  };

  const q = questions[current];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
        color: 'white',
        py: 6
      }}
    >
      <Container maxWidth="sm">
        {loading ? (
          <Typography>Loading Quiz...</Typography>
        ) : completed ? (
          <Card sx={{ p: 3, borderRadius: 3, background: '#fff' }}>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>Quiz Complete!</Typography>
              <Typography variant="h6">Score: {score} / {questions.length}</Typography>
              <Typography mt={2}>Time used: {Math.floor((300 - timeLeft) / 60)}:{String((300 - timeLeft) % 60).padStart(2, '0')}</Typography>
              <Box mt={3}>
                <Typography variant="h6">Results:</Typography>
                {questions.map((q, idx) => (
                  <Box key={q.questionId} mt={2}>
                    <Typography variant="subtitle2">{idx + 1}. {q.question}</Typography>
                    <Typography color="green">Correct: {correctAnswers[q.questionId]}</Typography>
                    <Typography color={answers[q.questionId]?.correct ? "blue" : "red"}>
                      Your Answer: {answers[q.questionId]?.answer || "Not answered"}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box mt={4} textAlign="center">
                <Button variant="contained" onClick={() => navigate('/')} sx={{ px: 4 }}>Back to Courses</Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <AccessTimeIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</Typography>
            </Box>

            <Typography variant="h4" textAlign="center" mb={3}>{courseId.toUpperCase()}</Typography>

            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Question {current + 1} of {questions.length}</Typography>
                <Typography mb={3}>{q?.question}</Typography>

                <Stack spacing={1}>
                  {q?.options.map((opt, idx) => {
                    const optionLabel = String.fromCharCode(65 + idx);
                    return (
                      <Button
                        key={idx}
                        variant="contained"
                        onClick={() => handleAnswer(q.questionId, opt)}
                        sx={{
                          backgroundColor: '#1976d2',
                          color: 'white',
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          paddingLeft: '16px',
                          '&:hover': { backgroundColor: '#093261' }
                        }}
                      >
                        {optionLabel}. {opt}
                      </Button>
                    );
                  })}
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                  <Button variant="outlined" onClick={handlePrevious} disabled={current === 0}>Previous</Button>
                  <Button variant="outlined" onClick={handleNext} disabled={current === questions.length - 1}>Next</Button>
                </Stack>

                <Box mt={3} textAlign="center">
                  <Button variant="contained" color="error" onClick={handleOpenConfirm} sx={{ px: 4 }}>Submit Quiz</Button>
                </Box>
              </CardContent>
            </Card>

            {/* Tracker Summary */}
            <Box mt={4} textAlign="center" fontWeight="medium">{Object.keys(answers).length} / {questions.length} Answered</Box>

            {/* Tracker Grid */}
            <Grid container spacing={1} justifyContent="center" mt={1}>
              {questions.map((_, idx) => {
                const answered = answers[questions[idx].questionId];
                return (
                  <Grid item key={idx}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: answered ? '#4caf50' : '#b0bec5',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setCurrent(idx);
                        localStorage.setItem('current', idx);
                      }}
                    >
                      {idx + 1}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
              <DialogTitle>Submit Quiz</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to submit?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseConfirm}>No</Button>
                <Button onClick={confirmSubmit} color="error">Yes</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Quiz;
