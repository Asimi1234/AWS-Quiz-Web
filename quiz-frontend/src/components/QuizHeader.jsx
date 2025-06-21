import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";

const QuizHeader = ({
  timeLeft,
  courseId,
  attemptsLeft,
  isAdmin,
  answeredCount,
  totalQuestions,
}) => {
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        mb={2}
      >
        <TimerIcon sx={{ fontSize: 26 }} />
        <Typography sx={{ fontSize: 18 }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </Typography>
      </Stack>

      <Typography
        variant="h4"
        sx={{ textAlign: "center", fontWeight: "bold", mb: 4 }}
      >
        {(courseId || "").toUpperCase()}
      </Typography>

      <Box
        sx={{
          backgroundColor: "#3a6f85",
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
          <>Admin Mode: You have {attemptsLeft} admin attempt(s) left.</>
        ) : (
          <>You have {attemptsLeft} free attempt(s) left.</>
        )}
      </Box>

      <Typography variant="body2" mt={1} mb={1} textAlign="center">
        Answered: {answeredCount} / {totalQuestions}
      </Typography>
    </>
  );
};

export default QuizHeader;
