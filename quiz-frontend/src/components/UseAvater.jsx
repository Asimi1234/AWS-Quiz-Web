import React, { useState } from "react";
import { Avatar, Box, Snackbar } from "@mui/material";

// Generate a color from string hash
const getColor = (str) => {
  const colors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#009688", "#4caf50"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Pick a random emoji based on hash
const getEmoji = (str) => {
  const emojis = ["🎉", "🔥", "⚡️", "✨", "💥", "🦄", "🚀", "💎"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % emojis.length;
  return emojis[index];
};

const UserAvatar = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const color = getColor(userId);
  const emoji = getEmoji(userId);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <Box>
      <Avatar
        onClick={handleClick}
        sx={{
          bgcolor: color,
          width: 48,
          height: 48,
          fontWeight: "bold",
          fontSize: "1.2rem",
          cursor: "pointer",
          animation: "pulse 1.8s infinite",
          "@keyframes pulse": {
            "0%": { boxShadow: `0 0 0 0 ${color}55` },
            "70%": { boxShadow: `0 0 0 10px transparent` },
            "100%": { boxShadow: `0 0 0 0 transparent` },
          },
        }}
      >
        {emoji}
      </Avatar>

      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={4000}
        message={`Your User ID: ${userId}`}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Box>
  );
};

export default UserAvatar;
