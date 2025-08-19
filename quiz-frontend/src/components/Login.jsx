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
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import QuizIcon from "@mui/icons-material/Quiz";
import googleIcon from "../images/google.png";

const API_BASE = process.env.REACT_APP_API_BASE;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
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
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mx: "auto", mb: 2, backgroundColor: "#1976d2" }}>
            <QuizIcon sx={{ fontSize: 40, color: "white" }} />
          </Avatar>
          <Typography variant="h4" fontWeight={600} color="text.primary" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #ccc", backgroundColor: "white" }}>
          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
              <Button fullWidth type="submit" variant="contained" size="large" sx={{ backgroundColor: "#1976d2", textTransform: "none", fontWeight: 500 }}>
                Sign In
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, color: "text.secondary" }}>Or continue with</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoogleLogin}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            <Box sx={{ mr: 2 }}>
              <img src={googleIcon} alt="Google" style={{ width: 24, height: 24 }} />
            </Box>
            Google
          </Button>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Stack spacing={1}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/signup" underline="hover" sx={{ fontWeight: 500 }}>
                  Sign up here
                </Link>
              </Typography>
              <Link href="/request-password-reset" underline="hover" sx={{ fontWeight: 500 }}>
                Forgot your password?
              </Link>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
