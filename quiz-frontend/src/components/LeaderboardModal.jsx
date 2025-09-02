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
          <Typography variant="body2">
            No scores yet for this course.
            <br />
            Be the first to take the quiz and claim the top spot!
          </Typography>
        ) : (
          <List>
            {leaderboard.map((user, index) => (
              <ListItem key={`${user.user_id}-${index}`}>
                <ListItemAvatar>
                  <UserAvatar username={user.username} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${index + 1}. ${user.username}`}
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
