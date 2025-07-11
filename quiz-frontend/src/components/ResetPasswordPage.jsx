import React, { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE;

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  // Get token from query param when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [location]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token.trim() || !newPassword.trim()) {
      toast.error("Please fill all fields.");
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
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred.");
    }
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
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            gutterBottom
            align="center"
          >
            Reset Your Password
          </Typography>

          <form onSubmit={handleResetPassword}>
            {/* Show token field only if token isn’t from URL */}
            {!token && (
              <TextField
                fullWidth
                variant="outlined"
                label="Reset Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              variant="outlined"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              Reset Password
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
