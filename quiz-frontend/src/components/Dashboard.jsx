import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  Fade,
  Divider,
} from "@mui/material";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import WithSidebarLayout from "../layouts/WithSidebarLayout";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const API_BASE_URL = process.env.REACT_APP_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/dashboard`, {
          headers: getAuthHeaders(),
        });
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        toast.error("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <WithSidebarLayout>
      <Box
        sx={{
          minHeight: "100vh",
          py: 4,
          px: isMobile ? 2 : 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Fade in timeout={700}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "2rem",
              }}
            >
              <InsertChartIcon fontSize="large" />
            </Avatar>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              A snapshot of your quiz journey 📊
            </Typography>
          </Box>
        </Fade>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 3 }}>
            Error: {error}
          </Typography>
        )}

        {!loading && !error && dashboardData && (
          <>
            <Fade in timeout={900}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: 4,
                  mb: 6,
                }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Total Quizzes Created
                    </Typography>
                    <Typography variant="h3" mt={1}>
                      {dashboardData.totalQuizzesCreated}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
                    color: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Total Attempts Made
                    </Typography>
                    <Typography variant="h3" mt={1}>
                      {dashboardData.totalAttemptsMade}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Fade>

            <Fade in timeout={1000}>
              <Card
                sx={{
                  mb: 6,
                  borderRadius: 4,
                  p: 2,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <BarChartIcon sx={{ color: "#00c6ff" }} />
                    <Typography variant="h5" fontWeight="bold">
                      Quiz Performance Trend
                    </Typography>
                  </Stack>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.recentAttempts.slice(-7)}>
                      <XAxis dataKey="quizId" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Fade>

            <Fade in timeout={1100}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <HistoryIcon sx={{ color: "#5e72e4" }} />
                  <Typography variant="h5" fontWeight="bold">
                    Recent Attempts
                  </Typography>
                </Stack>

                {dashboardData.recentAttempts.length === 0 ? (
                  <Typography>No recent attempts found.</Typography>
                ) : (
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <CardContent>
                      <List disablePadding>
                        {dashboardData.recentAttempts.map((attempt, index) => (
                          <React.Fragment key={index}>
                            <ListItem
                              button
                              component="a"
                              href={`/quiz-result/${attempt.quizId}`}
                            >
                              <ListItemText
                                primary={
                                  <Typography fontWeight="bold">
                                    Quiz ID: {attempt.quizId || "N/A"}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    Score: {attempt.score ?? "N/A"} &nbsp;|&nbsp; {dayjs(attempt.timestamp).fromNow()}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {index !== dashboardData.recentAttempts.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Fade>
          </>
        )}
      </Box>
    </WithSidebarLayout>
  );
};

export default Dashboard;