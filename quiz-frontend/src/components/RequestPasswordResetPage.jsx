import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  Fade,
  Link,
} from "@mui/material";
import { toast } from "react-toastify";
import LockResetIcon from "@mui/icons-material/LockReset";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import QuizIcon from "@mui/icons-material/Quiz";

const API_BASE = process.env.REACT_APP_API_BASE;

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset link sent successfully!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to request reset.");
      }
    } catch (error) {
      console.error("Reset request error:", error);
      toast.error("An error occurred while sending reset link.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
              }}
            >
              <QuizIcon sx={{ fontSize: 40, color: "white" }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We'll help you get back into your account
            </Typography>
          </Box>
        </Fade>

        <Fade in timeout={1000}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              pt: 5,
              pb: 6,
              borderRadius: 5,
              backgroundColor: "#fff",
              boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
              mb: 8,
            }}
          >
            <Box textAlign="center" mb={3}>
              <LockResetIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Enter your email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll send you a reset link
              </Typography>
            </Box>

            <form onSubmit={handleRequestReset}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: "#888" }} />,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<SendIcon />}
                >
                  Send Reset Link
                </Button>
              </Stack>
            </form>

            <Box mt={5} textAlign="center">
              <Typography variant="body2" sx={{ mb: 1 }}>
                Remember your password?{' '}
                <Link href="/login" underline="hover">
                  Sign in
                </Link>
              </Typography>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/signup" underline="hover">
                  Create one
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default RequestPasswordResetPage;
