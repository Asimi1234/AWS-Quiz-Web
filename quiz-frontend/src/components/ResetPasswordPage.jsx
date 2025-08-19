import React, { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import SecurityIcon from "@mui/icons-material/Security";


const API_BASE = process.env.REACT_APP_API_BASE;

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [location]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!token.trim() || !newPassword.trim()) {
      toast.error("Please fill all fields.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login", { state: { fromReset: true } });
        }, 1500);
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred while resetting your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100svh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#2c3e50",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Fade in timeout={600}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <Box
              component="img"
              src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
              alt="Company Logo"
              sx={{ height: 60, width: 60, mr: 2, borderRadius: 2 }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              IzyQuiz Lite
            </Typography>
          </Box>
        </Fade>

        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <SecurityIcon sx={{ fontSize: 50, color: "white" }} />
            </Avatar>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Set New Password
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose a strong password to secure your account 🔒
            </Typography>
          </Box>
        </Fade>

        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              mt: 4,
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Reset Password
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your new password must be at least 6 characters long.
            </Alert>
            <form onSubmit={handleResetPassword}>
              <Stack spacing={3}>
                {!token && (
                  <TextField
                    fullWidth
                    label="Reset Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                )}
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </Stack>
            </form>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2">
                Remember your password?{' '}
                <Link href="/login" underline="hover">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
