import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrandHeader from "./BrandHeader";

const API_BASE = process.env.REACT_APP_API_BASE;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Please enter your username and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        toast.success("Logged in successfully!");
        navigate("/courses");
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100svh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        {/* Logo and App Name */}
        <BrandHeader />

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
            variant="h6"
            align="center"
            gutterBottom
            sx={{ color: "#0f4c75", fontWeight: "bold" }}
          >
            Login to Your Account
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              variant="outlined"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
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
              Login
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              <Link
                href="/request-password-reset"
                underline="hover"
                sx={{ color: "#0f4c75", fontWeight: "bold" }}
              >
                Forgot Password?
              </Link>
            </Typography>

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Don’t have an account?{" "}
              <Link
                href="/signup"
                underline="hover"
                sx={{ color: "#0f4c75", fontWeight: "bold" }}
              >
                Sign up
              </Link>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
