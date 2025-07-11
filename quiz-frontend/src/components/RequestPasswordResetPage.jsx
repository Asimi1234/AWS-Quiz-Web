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
import { toast } from "react-toastify";
import { Link as RouterLink } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE;

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [tokenSent, setTokenSent] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
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
        toast.success("Reset link sent successfully!");
        window.alert("Reset token was successfully sent!");
        setTokenSent(true); // 👈 enable the navigation link
      } else {
        toast.error(data.message || "Failed to request reset.");
      }
    } catch (error) {
      console.error("Reset request error:", error);
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
            Request Password Reset
          </Typography>

          <form onSubmit={handleRequestReset}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </Button>
          </form>

          {/* Show navigation link only when token has been sent */}
          {tokenSent && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" gutterBottom>
                Proceed to Reset Password:
              </Typography>
              <Button
                component={RouterLink}
                to="/reset-password"
                variant="outlined"
                sx={{
                  mt: 1,
                  borderColor: "#0f4c75",
                  color: "#0f4c75",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                Go to Reset Password Page
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default RequestPasswordResetPage;
