import React, { useEffect, useState, useCallback } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import QuizHeader from "./QuizHeader";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ConfirmDialog from "./ConfirmDialog";
import AdminDialog from "./AdminDialog";
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
      const res = await fetch(url, 
        {method:'GET', 
         headers: getAuthHeaders()});

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
      // Do NOT redirect unless we know it's an auth error
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

  const handleOpenConfirm = () => setConfirmDialogOpen(true);
  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false);
    handleFinalSubmit();
  };
  const handleCancelSubmit = () => setConfirmDialogOpen(false);

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
          attemptsLeft={remainingAttempts}
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
          handleNext={() =>
            setCurrent((c) => Math.min(c + 1, questions.length - 1))
          }
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
