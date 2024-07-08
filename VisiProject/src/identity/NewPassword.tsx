import React, { useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Divider,
  Button,
  InputAdornment,
  Paper,
  Grid,
} from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const NewPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRevealPwd1, setIsRevealPwd1] = useState<boolean>(false);
  const [isRevealPwd2, setIsRevealPwd2] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const validatePassword = (password: string): boolean => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$%^&£*\-_+=[\]{}|\\:',?\/`~""()<>;!]{10,32}$/;

    if (!re.test(String(password))) {
      setPasswordError(
        "The password must contain uppercase, lowercase letters, special characters and numbers",
      );
      return false;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 10 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ): boolean => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleSetPassword = async () => {
    if (passwordError === "" && confirmPasswordError === "") {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const urlData = searchParams.get("userId");

        if (!urlData || urlData.length != 64) {
          throw new Error("Url has not a good format");
        }

        const response = await fetch(
          `${apiUrl}/api/v1/user/${encodeURIComponent(urlData)}/change-password`,
          {
            method: "PUT",
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: password }),
          },
        );

        if (!response.ok) {
          navigate("/no_success_notification?typePage=ResetPassword");
          throw new Error("Failed to set new password");
        }
        navigate("/success_notification?typePage=ResetPassword");
      } catch (error) {
        console.error("Error setting new password:", error);
        navigate("/no_success_notification?typePage=ResetPassword");
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item sx={boxSection}>
        <Paper
          sx={{ ...paperSection, ...newPasswordContainerStyle }}
          elevation={10}
        >
          <Box>
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Reset password
            </Typography>
            <Divider sx={lineUpStyle} />
            <Box
              style={{
                width: "100%",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <TextField
                type={isRevealPwd1 ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                label="New password"
                fullWidth
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {password.length > 0 && (
                        <IconButton
                          sx={eyeButtonStyle}
                          onClick={() =>
                            setIsRevealPwd1((prevState) => !prevState)
                          }
                        >
                          {isRevealPwd1 ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              style={{
                width: "100%",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <TextField
                type={isRevealPwd2 ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() =>
                  validateConfirmPassword(password, confirmPassword)
                }
                label="Confirm new password"
                fullWidth
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmPassword.length > 0 && (
                        <IconButton
                          sx={eyeButtonStyle}
                          onClick={() =>
                            setIsRevealPwd2((prevState) => !prevState)
                          }
                        >
                          {isRevealPwd2 ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleSetPassword}
              disabled={loading}
              sx={setPasswordButtonStyle}
            >
              {loading ? "Set password..." : "Set password"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const newPasswordContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const eyeButtonStyle = {
  backgroundColor: "transparent",
  position: "absolute",
  right: "0",
  top: "50%",
  transform: "translateY(-50%)",
  "&:hover": {
    backgroundColor: "transparent",
    color: "black",
  },
};

const lineUpStyle = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

const setPasswordButtonStyle = {
  textTransform: "unset",
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  backgroundColor: "#2E8B57",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#25764F",
  },
};

const boxSection = {
  flex: 1,
  height: "100%",
};

const paperSection = {
  paddingLeft: "16px",
  paddingRight: "16px",
  height: "100%",
};

export default NewPassword;
