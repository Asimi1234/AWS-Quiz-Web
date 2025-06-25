import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import UserAvatar from "./UseAvater";

const LeaderboardModal = ({ open, onClose, leaderboard, courseId }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{courseId} Top 10 Scores</DialogTitle>
      <DialogContent dividers>
        {leaderboard.length === 0 ? (
          <Typography variant="body2">No scores yet for this course.</Typography>
        ) : (
          <List>
            {leaderboard.map((user, index) => (
              <ListItem key={user.user_id}>
                <ListItemAvatar>
                  <UserAvatar userId={user.user_id} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${index + 1}. ${user.user_id}`}
                  secondary={`Score: ${user.score}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
