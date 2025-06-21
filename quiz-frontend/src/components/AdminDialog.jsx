import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AdminDialog = ({
  open,
  onClose,
  onSubmit,
  adminInput,
  setAdminInput,
  adminError,
  navigate,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Dialog open={open}>
      <DialogTitle>Maximum Attempts Reached</DialogTitle>
      <DialogContent>
        <Typography>
          You have reached the maximum number of attempts for this quiz.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Enter admin override code to continue:
        </Typography>

        <FormControl
          fullWidth
          margin="dense"
          variant="outlined"
          error={!!adminError}
        >
          <InputLabel htmlFor="admin-code">Admin Code</InputLabel>
          <OutlinedInput
            id="admin-code"
            type={showPassword ? "text" : "password"}
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Admin Code"
          />
          {adminError && <FormHelperText>{adminError}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate("/")}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDialog;
