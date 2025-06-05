import React, { useEffect, useState, useCallback } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import QuizHeader from "./QuizHeader";

import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ConfirmDialog from "./ConfirmDialog";
import AdminDialog from "./AdminDialog";

const API_BASE = process.env.REACT_APP_API_BASE;
const secretCode = process.env.REACT_APP_CODE;

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const progressKey = `quiz-progress-${courseId}`;
  const attemptsKey = `attempts-${courseId}`;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const maxFreeAttempts = 5;
  const maxAttempts = 60;

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/start-quiz?courseId=${courseId}`
      );
      const data = await response.json();
      setQuestions(shuffleQuestions(data.questions));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch questions", error);
      setLoading(false);
    }
  }, [courseId]);

  const shuffleQuestions = (questions) => {
    const shuffled = questions.map((q) => ({
      ...q,
      options: q.options.sort(() => 0.5 - Math.random()),
    }));
    return shuffled.sort(() => 0.5 - Math.random());
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { answer } }));
  };

  const handleFinalSubmit = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/get-answer?courseId=${courseId}`
      );
      const data = await response.json();
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
      const savedAttempts = parseInt(localStorage.getItem(attemptsKey)) || 0;
      const newAttempts = savedAttempts + 1;
      localStorage.setItem(attemptsKey, newAttempts);
      setAttempts(newAttempts);
      localStorage.removeItem(progressKey);
    } catch (err) {
      alert("Error submitting quiz.");
    }
  }, [answers, courseId, attemptsKey, progressKey]);

  const handleAdminSubmit = () => {
    if (adminInput === secretCode) {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      setAdminDialogOpen(false);
      setAdminError("");
      setLoading(true);
      fetchQuestions();
    } else {
      setAdminError("Invalid code");
    }
  };
  const handleOpenConfirm = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false);
    handleFinalSubmit();
  };

  const handleCancelSubmit = () => {
    setConfirmDialogOpen(false);
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(savedAdmin);

    const savedAttempts = parseInt(localStorage.getItem(attemptsKey)) || 0;
    setAttempts(savedAttempts);

    if (savedAttempts >= maxFreeAttempts && !savedAdmin) {
      setAdminDialogOpen(true);
      setLoading(false);
      return;
    }

    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setQuestions(parsed.questions || []);
        setCurrent(parsed.current || 0);
        setAnswers(parsed.answers || {});
        setTimeLeft(parsed.timeLeft || 300);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse saved quiz progress", err);
      }
    }

    fetchQuestions();
  }, [courseId, attemptsKey, fetchQuestions, progressKey]);

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

  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (completed)
    return (
      <ResultCard
        score={score}
        questions={questions}
        answers={answers}
        correctAnswers={correctAnswers}
        courseId={courseId}
        navigate={navigate}
      />
    );

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: 2, backgroundColor: "#f5f5f5" }}>
      <Container maxWidth="sm">
        <QuizHeader
          timeLeft={timeLeft}
          attemptsLeft={(isAdmin ? maxAttempts : maxFreeAttempts) - attempts}
          isAdmin={isAdmin}
          answeredCount={Object.keys(answers).length}
          totalQuestions={questions.length}
          courseId={courseId}
        />

        <QuestionCard
  question={questions[current]}
  questionIndex={current}
  totalQuestions={questions.length}
  answers={answers}
  handleAnswer={handleAnswer}
  handleNext={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
  handlePrevious={() => setCurrent((c) => Math.max(c - 1, 0))}
  handleOpenConfirm={handleOpenConfirm}
  questions={questions}
  current={current}
  setCurrent={setCurrent}
/>


        <AdminDialog
          open={adminDialogOpen}
          onClose={() => setAdminDialogOpen(false)}
          onSubmit={handleAdminSubmit}
          adminInput={adminInput}
          setAdminInput={setAdminInput}
          adminError={adminError}
          navigate={navigate}
        />

        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={handleCancelSubmit}
          onConfirm={handleConfirmSubmit}
        />
      </Container>
    </Box>
  );
};

export default Quiz;
