import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import WithSidebarLayout from "../layouts/WithSidebarLayout";

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const StartQuizPage = () => {
  const { quizId, courseId } = useParams(); // URL should match /start-quiz/:quizId/:courseId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;

    const fetchQuiz = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("You must be logged in to start a quiz.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/user/get-quiz?quizId=${quizId}&courseId=${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.data.success) {
          throw new Error("Quiz not found or access denied");
        }

        if (!didCancel) {
          navigate(`/quiz/${quizId}/play?courseId=${courseId}`);
        }
      } catch (err) {
        if (!didCancel) {
          toast.error("Failed to load quiz.");
          navigate("/dashboard");
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    if (quizId && courseId) {
      fetchQuiz();
    } else {
      toast.error("Invalid quiz or course ID.");
      navigate("/dashboard");
    }

    return () => {
      didCancel = true;
    };
  }, [quizId, courseId, navigate]);

  return (
    <WithSidebarLayout>
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading quiz...
          </Typography>
        </Box>
      </Container>
    </WithSidebarLayout>
  );
};

export default StartQuizPage;
