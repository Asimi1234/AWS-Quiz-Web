import React, { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import BrandHeader from "./BrandHeader";
import googleIcon from "../images/google.png";

const API_BASE = process.env.REACT_APP_API_BASE;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const fromReset = location.state?.fromReset || false;

  useEffect(() => {
    if (fromReset) {
      toast.success("Password reset successful. Please log in.");
      navigate(location.pathname, { replace: true });
    }
  }, [fromReset, location.pathname, navigate]);

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
        const decoded = jwtDecode(data.token);

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", decoded.userId);
        localStorage.setItem("username", decoded.username);

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

  const handleGoogleLogin = () => {
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

          if (res.ok && result.token) {
            const decoded = jwtDecode(result.token);

            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", decoded.userId);
            localStorage.setItem("username", decoded.username);

            toast.success("Signed in with Google!");
            navigate("/courses");
          } else {
            toast.error(result.message || "Google login failed.");
          }
        } catch (err) {
          console.error("Google login error:", err);
          toast.error("An error occurred with Google login.");
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
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 1, mb: 1 }}>
            Or login with:
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <IconButton
              onClick={handleGoogleLogin}
              sx={{
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                "&:hover": { backgroundColor: "#f7f7f7" },
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
              Don’t have an account?{" "}
              <Link
                href="/signup"
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
                Sign up
              </Link>
            </Typography>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            <Link
              href="/request-password-reset"
              sx={{
                color: "#0f4c75",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot Password?
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
