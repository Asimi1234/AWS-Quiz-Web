import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
} from "@mui/material";

const AdminDialog = ({
  open,
  onClose,
  onSubmit,
  adminInput,
  setAdminInput,
  adminError,
  navigate,
}) => (
  <Dialog open={open}>
    <DialogTitle>Maximum Attempts Reached</DialogTitle>
    <DialogContent>
      <Typography>
        You have reached the maximum number of attempts for this quiz.
      </Typography>
      <Typography>Enter admin override code to continue:</Typography>
      <TextField
        autoFocus
        margin="dense"
        label="Admin Code"
        fullWidth
        value={adminInput}
        onChange={(e) => setAdminInput(e.target.value)}
        error={!!adminError}
        helperText={adminError}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => navigate("/")}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained">
        Submit
      </Button>
    </DialogActions>
  </Dialog>
);

export default AdminDialog;
