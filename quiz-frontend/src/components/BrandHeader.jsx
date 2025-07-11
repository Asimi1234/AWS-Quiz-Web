// src/components/BrandHeader.js
import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

const BrandHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
      <Box
        component="img"
        src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
        alt="Company Logo"
        sx={{ height: 50, width: 50, mr: 2 }}
      />
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        color="#FFFFFF"
      >
        IzyQuiz Lite
      </Typography>
    </Box>
  );
};

export default BrandHeader;
