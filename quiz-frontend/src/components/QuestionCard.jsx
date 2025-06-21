import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
} from "@mui/material";
import QuestionNavigation from "./QuestionNavigator";


const QuestionCard = ({
  question,
  questionIndex, 
  totalQuestions,
  answers,
  handleAnswer,
  handlePrevious, 
  handleNext, 
  handleOpenConfirm, 
  questions,       
  current,        
  setCurrent, 
}) => {
  if (!question) {
    return <Typography>Loading question...</Typography>;
  }

  return (
    <Card elevation={5} sx={{ borderRadius: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h6">
          Question {questionIndex + 1} of {totalQuestions}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {question.question}
        </Typography>
        <Stack spacing={2}>
          {question.options.map((opt, idx) => (
            <Button
              key={idx}
              variant="contained"
              onClick={() => handleAnswer(question.questionId, opt)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                backgroundColor:
                  answers[question?.questionId]?.answer === opt
                    ? "#103861"
                    : "white",
                color:
                  answers[question?.questionId]?.answer === opt
                    ? "white"
                    : "black",
                border: "1px solid #ccc",
                "&:hover": {
                  backgroundColor:
                    answers[question?.questionId]?.answer === opt
                      ? "#115293"
                      : "#f0f0f0",
                },
              }}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={questionIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={questionIndex === totalQuestions - 1}
          >
            Next
          </Button>
        </Stack>
        <Box mt={3}>
          <QuestionNavigation
            questions={questions}
            answers={answers}
            current={current}
            setCurrent={setCurrent}
          />
        </Box>
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
  );
};

export default QuestionCard;