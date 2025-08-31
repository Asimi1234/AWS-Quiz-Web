import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const menuItems = [
    // { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Courses", icon: <LibraryBooksIcon />, path: "/courses" },
    // { text: "My Quizzes", icon: <QuizIcon />, path: "/my-quizzes" },
    // { text: "Create Quiz", icon: <CreateIcon />, path: "/create-quiz" },
  ];

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: "auto",
            mb: 1,
            backgroundColor: theme.palette.primary.main,
          }}
          src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
        />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          IzyQuiz
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Lite Version
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => handleNavigate(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              mx: 1,
              pl: 2,
              backgroundColor: isActive(item.path) ? "#e3f2fd" : "transparent",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? "bold" : "medium",
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, textAlign: "center" }}>
        <Paper elevation={0} sx={{ py: 1, backgroundColor: "#f1f1f1" }}>
          <Typography variant="caption" color="text.secondary">
            Version 2.0.0
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth };