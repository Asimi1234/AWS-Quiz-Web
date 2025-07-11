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
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_BASE;

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate fields filled
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      // Check for existing user first
      const checkResponse = await fetch(`${API_BASE}/check-user-exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        toast.error(checkData.message || "Error checking user.");
        return;
      }

      if (checkData.exists) {
        toast.error("Username or email already exists.");
        return;
      }

      // If safe, proceed with signup
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signup successful! You can now log in.");
        localStorage.setItem("hasAccount", "true");
        navigate("/login");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
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
            Create Your Account
          </Typography>

          <form onSubmit={handleSignup}>
            <TextField
              fullWidth
              variant="outlined"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#0f4c75",
                "&:hover": { backgroundColor: "#3282b8" },
                mb: 1,
              }}
            >
              Sign Up
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Already have an account?{" "}
              <Link
                href="/login"
                underline="hover"
                sx={{ color: "#0f4c75", fontWeight: "bold" }}
              >
                Login here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
