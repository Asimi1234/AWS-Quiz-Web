import React, { useState } from "react";
import { Avatar, Box, Snackbar } from "@mui/material";

// Helper: Get hashed index from string for any array
const getHashedIndex = (str, array) => {
  const safeStr = str || "user"; // fallback if null/undefined
  let hash = 0;
  for (let i = 0; i < safeStr.length; i++) {
    hash = safeStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % array.length;
  return index;
};

// Generate a color based on username hash
const getColor = (str) => {
  const colors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#009688", "#4caf50"];
  return colors[getHashedIndex(str, colors)];
};

// Pick a random emoji based on username hash
const getEmoji = (str) => {
  const emojis = ["🎉", "🔥", "⚡️", "✨", "💥", "🦄", "🚀", "💎"];
  return emojis[getHashedIndex(str, emojis)];
};

const UserAvatar = ({ username }) => {
  const [open, setOpen] = useState(false);
  const color = getColor(username);
  const emoji = getEmoji(username);

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
        message={`Username: ${username || "Anonymous"}`}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Box>
  );
};

export default UserAvatar;
