import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Button,
  Box, LinearProgress, Stack, useMediaQuery
} from '@mui/material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
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
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, completed]);

  const handleAnswer = (questionId, answer) => {
    axios.post(`${API_BASE}/submit-answer`, {
      question_id: questionId,
      answer,
    }).then(res => {
      if (res.data.correct) setScore(score + 1);
    }).catch(err => {
      console.error("Axios error submitting answer:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
      } else {
        alert("Network error. Check your API URL or CORS settings.");
      }
    });
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
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
              Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const q = questions[current];
  
  return (
    <Container maxWidth="sm" sx={{ mt: isMobile ? 8: 3 }}>
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
                onClick={() => handleAnswer(q.questionId, opt)}
              >
                {opt}
              </Button>
            ))}
          </Stack>

          {/* Forward & Backward Navigation */}
          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={current === 0}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={current === questions.length - 1}
            >
              Next
            </Button>
          </Stack>

        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Box mt={2}>
        <LinearProgress variant="determinate" value={((current + 1) / questions.length) * 100} />
      </Box>

      {/* Timer display */}
      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </Typography>
      </Box>
    </Container>
  );
};

export default Quiz;
