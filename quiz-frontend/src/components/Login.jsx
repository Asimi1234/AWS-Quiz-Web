import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogin = (e) => {
  e.preventDefault();
  if (!userId.trim()) {
    toast.error("Please enter your User ID.");
    return;
  }
  localStorage.setItem("userId", userId.trim());
  toast.success("Logged in successfully!");
  navigate("/courses");  // corrected path
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={5}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "#ffffffee",
            color: "#000",
          }}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight="bold"
            gutterBottom
            align="center"
          >
            IzyQuiz Lite
          </Typography>

          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{ color: "#0f4c75" }}
          >
            Enter Your User ID
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              variant="outlined"
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#0f4c75",
                "&:hover": { backgroundColor: "#3282b8" },
              }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
