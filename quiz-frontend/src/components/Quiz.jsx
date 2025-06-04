import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Card, CardContent, Typography, Button,
  Box, LinearProgress, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE;

const Quiz = () => {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // Copy/Paste Prevention Functions
  const handleKeyDown = (e) => {
    if (completed || loading) return;
    
    // Prevent copy (Ctrl+C, Ctrl+A, Ctrl+X)
    if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 88)) {
      e.preventDefault();
      return false;
    }
    // Prevent paste (Ctrl+V)
    if (e.ctrlKey && e.keyCode === 86) {
      e.preventDefault();
      return false;
    }
    // Prevent F12 (Developer Tools)
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Prevent Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    // Prevent Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
  };

  const handleContextMenu = (e) => {
    if (completed || loading) return;
    e.preventDefault();
    return false;
  };

  const handleSelectStart = (e) => {
    if (completed || loading) return;
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e) => {
    if (completed || loading) return;
    e.preventDefault();
    return false;
  };

  // Move handleFinalSubmit above useEffect to prevent ESLint warning
  const handleFinalSubmit = useCallback(() => {
    axios.get(`${API_BASE}/get-answer?courseId=${courseId}`)
      .then(res => {
        const corrects = res.data.correct_answers; 
        setCorrectAnswers(corrects);
        
        // Calculate final score by comparing user answers to correct answers
        let finalScore = 0;
        for (const qId in corrects) {
          if (answers[qId]?.answer === corrects[qId]) {
            finalScore++;
          }
        }
        setScore(finalScore);  //used to set final score
        
        setCompleted(true);
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
        setScore(0);           // used to reset score
        setAnswers({});        // used to clear previous answers
        setCompleted(false);
        setTimeLeft(300);
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
    axios.post(`${API_BASE}/submit-answer`, {
      question_id: questionId,
      answer,
      courseId: courseId
    })
    .then(res => {
      const isCorrect = res.data.correct; 
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: { answer, correct: isCorrect }
      }));
    })
    .catch(err => {
      console.error("Error submitting answer:", err);
      alert("Failed to submit answer.");
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

  const q = questions[current];
  const userAnswer = q ? answers[q.questionId]?.answer : null;

  return (
    <Box
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onSelectStart={handleSelectStart}
      onDragStart={handleDragStart}
      tabIndex={0} // used to make the Box focusable to capture keyboard events
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
        color: 'white',
        py: 6,
        outline: 'none', 
        // Additional CSS for copy prevention
        userSelect: completed || loading ? 'auto' : 'none',
        WebkitUserSelect: completed || loading ? 'auto' : 'none',
        MozUserSelect: completed || loading ? 'auto' : 'none',
        msUserSelect: completed || loading ? 'auto' : 'none',
      }}
    >
      <Container maxWidth="sm">
        {loading ? (
          <LinearProgress />
        ) : completed ? (
          <Container maxWidth="sm">
            <Card elevation={5} sx={{ p: 3, borderRadius: 3, background: '#fff', }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="primary">
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
                    <Box key={q.questionId} mt={2}>
                      <Typography variant="subtitle2">{idx + 1}. {q.question}</Typography>
                      <Typography variant="body2" color="green">
                        Correct: {correctAnswers[q.questionId]}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={answers[q.questionId]?.correct ? "blue" : "red"}
                      >
                        Your Answer: {answers[q.questionId]?.answer || "Not answered"}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Back to Course Selection Button */}
                <Box mt={4} textAlign="center">
                  <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ px: 4, py: 1, backgroundColor: '#0F4C75' }}
                  >
                    Back to Course Selection
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                mb: 4,
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              {courseId.toUpperCase()}
            </Typography>

            <Card 
              elevation={5} 
              sx={{ 
                borderRadius: 3, 
                p: 2,
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ userSelect: 'none' }}>
                  Question {current + 1} of {questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, userSelect: 'none' }}>
                  {q?.question}
                </Typography>

                <Stack spacing={2}>
                  {q?.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="contained"
                      color={userAnswer === opt ? "primary" : "secondary"}
                      onClick={() => handleAnswer(q.questionId, opt)}
                      sx={{
                        backgroundColor: userAnswer === opt ? '#0D47A1' : '#1976d2',
                        color: 'white',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        '&:hover': {
                          backgroundColor: '#1565c0'
                        }
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={current === 0}
                    sx={{ color: '#0D47A1', borderColor: '#1976d2' }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleNext}
                    disabled={current === questions.length - 1}
                    sx={{ color: '#0D47A1', borderColor: '#1976d2' }}
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

            <Box mt={3}>
              <LinearProgress
                variant="determinate"
                value={((current + 1) / questions.length) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#1c1c1c',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#64b5f6'
                  }
                }}
              />
            </Box>

            <Box mt={2} textAlign="center">
              <Typography variant="body2" sx={{ userSelect: 'none' }}>
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
          </>
        )}
      </Container>
    </Box>
  );
};

export default Quiz;