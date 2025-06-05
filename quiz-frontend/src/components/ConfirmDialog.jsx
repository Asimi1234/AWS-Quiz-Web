import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const ConfirmDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Submit Quiz</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to submit?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>No</Button>
      <Button onClick={onConfirm} color="error">
        Yes
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
