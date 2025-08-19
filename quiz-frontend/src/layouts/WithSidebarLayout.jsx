import React, { useState } from "react";
import {
  Box,
  IconButton,
  Toolbar,
  AppBar,
  useMediaQuery,
  useTheme,
  Stack,
  Typography,
  Paper,
  Fade,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import Sidebar, { drawerWidth } from "../components/Sidebar";
import UserAvatar from "../components/UseAvater";

const WithSidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const username = localStorage.getItem("username");

  return (
    <Box
      sx={{
        display: "block",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#f9f9f9",
        color: "#333",
      }}
    >
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: sidebarOpen && !isMobile ? `${drawerWidth}px` : 0,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          padding: 0,
        }}
      >
        <Fade in timeout={400}>
          <AppBar
            position="static"
            elevation={0}
            sx={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e0e0e0",
              px: 2,
              py: 1,
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1,
                minHeight: "64px !important",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  onClick={toggleSidebar}
                  sx={{
                    color: "#333",
                  }}
                  edge="start"
                  aria-label="menu"
                >
                  <MenuIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Paper
                  sx={{
                    backgroundColor: "#f1f1f1",
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <UserAvatar username={username} />
                  {!isMobile && (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#333",
                          fontWeight: "600",
                          lineHeight: 1.2,
                        }}
                      >
                        Welcome back!
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        {username || "User"}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <IconButton
                  aria-label="Logout"
                  onClick={handleLogout}
                  sx={{
                    color: "#f44336",
                    backgroundColor: "#fdecea",
                    border: "1px solid #f44336",
                    p: "10px",
                    "&:hover": {
                      backgroundColor: "#fdd8d4",
                      borderColor: "#e53935",
                    },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Stack>
            </Toolbar>
          </AppBar>
        </Fade>

        <Box sx={{ p: isMobile ? 1 : 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default WithSidebarLayout;
