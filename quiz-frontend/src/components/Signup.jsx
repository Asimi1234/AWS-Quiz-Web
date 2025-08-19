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
  Avatar,
  Stack,
  Fade,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import QuizIcon from "@mui/icons-material/Quiz";
import googleIcon from "../images/google.png";

const API_BASE = process.env.REACT_APP_API_BASE;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        toast.success("Account created successfully!");
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        localStorage.setItem("userId", decoded.userId);
        localStorage.setItem("username", decoded.username || username);
        navigate("/courses");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup.");
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

          if (res.ok && result.token) {
            const decoded = jwtDecode(result.token);
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", decoded.userId);
            localStorage.setItem("username", decoded.username);
            toast.success("Signed up with Google!");
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
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
              <QuizIcon sx={{ fontSize: 50, color: "white" }} />
            </Avatar>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Join Us Today!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create your IzyQuiz Lite account 🚀
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
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <PersonAddIcon color="primary" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">
                Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join thousands of learners worldwide
              </Typography>
            </Box>

            <form onSubmit={handleSignup}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1 }} /> }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1 }} />,
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />

                <Button variant="contained" type="submit" fullWidth size="large">
                  Create Account
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>Or</Divider>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleGoogleSignup}
              startIcon={<img src={googleIcon} alt="Google" style={{ width: 24, height: 24 }} />}
            >
              Google
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SignupPage;
