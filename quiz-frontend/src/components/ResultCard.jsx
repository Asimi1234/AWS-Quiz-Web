import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

const ResultCard = ({
  questions,
  answers,
  correctAnswers,
  score,
  progressKey,
  navigate,
}) => (
  <Card elevation={5} sx={{ p: 3, borderRadius: 3, background: "#fff" }}>
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
            <Typography variant="body2" color="#0f084a">
              Correct: {correctAnswers[q.questionId]}
            </Typography>
            <Typography
              variant="body2"
              color={
                answers[q.questionId]?.answer?.trim().toLowerCase() ===
                correctAnswers[q.questionId]?.trim().toLowerCase()
                  ? "green"
                  : "red"
              }
            >
              Your Answer: {answers[q.questionId]?.answer || "Not answered"}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box mt={4} textAlign="center">
        <Button
          variant="contained"
          onClick={() => {
            localStorage.removeItem(progressKey);
            navigate("/");
          }}
          sx={{ px: 4, py: 1, backgroundColor: "#0F4C75" }}
        >
          Back
        </Button>
      </Box>
    </CardContent>
  </Card>
);

export default ResultCard;
