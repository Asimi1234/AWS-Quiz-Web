import React from "react";
import { Grid, Box } from "@mui/material";

const QuestionNavigator = ({ questions, answers, setCurrent }) => (
  <Grid container spacing={1} mb={3} justifyContent="center">
    {questions.map((q, idx) => (
      <Grid item xs={1} key={q.questionId}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: answers[q.questionId] ? "#64b5f6" : "#ccc",
            color: "#000",
            fontSize: 14,
            cursor: "pointer",
          }}
          onClick={() => setCurrent(idx)}
        >
          {idx + 1}
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default QuestionNavigator;