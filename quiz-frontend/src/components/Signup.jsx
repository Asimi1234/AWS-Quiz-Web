import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrandHeader from "./BrandHeader";
import googleIcon from "../images/google.png";
import { jwtDecode } from "jwt-decode";

const API_BASE = process.env.REACT_APP_API_BASE;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
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
        toast.success("Signup successful!");
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        localStorage.setItem("username", decoded.username || username);
        navigate("/courses");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred.");
    }
  };

  const handleGoogleSignup = () => {
    if (!window.google?.accounts?.oauth2) {
      toast.error("Google SDK not loaded.");
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile openid",
      callback: async (response) => {
        if (!response || !response.access_token) {
          toast.error("Failed to authenticate with Google.");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: response.access_token }),
          });

          const result = await res.json();

          if (res.ok) {
            toast.success("Signed in with Google!");
            localStorage.setItem("token", result.token);

            const decoded = jwtDecode(result.token);
            localStorage.setItem("username", decoded.username || "User");

            navigate("/courses");
          } else {
            toast.error(result.message || "Google signup failed.");
          }
        } catch (err) {
          console.error("Google signup error:", err);
          toast.error("An error occurred with Google signup.");
        }
      },
    });

    client.requestAccessToken();
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
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 1, mb: 1 }}>
            Or sign up with:
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <IconButton
              onClick={handleGoogleSignup}
              sx={{
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f7f7f7",
                },
              }}
            >
              <img
                src={googleIcon}
                alt="Google"
                style={{ width: 24, height: 24 }}
              />
            </IconButton>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ color: "#333" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                underline="none"
                sx={{
                  color: "#0f4c75",
                  fontWeight: "bold",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#3282b8",
                  },
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
