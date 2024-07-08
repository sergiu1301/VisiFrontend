import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Box,
  InputAdornment,
  Paper,
  Grid,
} from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRevealPwd1, setIsRevealPwd1] = useState<boolean>(false);
  const [isRevealPwd2, setIsRevealPwd2] = useState<boolean>(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const validateEmail = (email: string): boolean => {
    const re =
      /^(?!.{255})(?![^@]{65})((([^<>()\[\]\\.,;:\s@""]+(\.[^<>()\[\]\\.,;:\s@""]+)*)|("".+"")))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email))) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

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

  const validateFirstName = (firstName: string): boolean => {
    let valid = true;
    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      valid = false;
    } else {
      setFirstNameError("");
    }

    return valid;
  };

  const validateLastName = (lastName: string): boolean => {
    let valid = true;

    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      valid = false;
    } else {
      setLastNameError("");
    }

    return valid;
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleFirstNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/connect/register`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          firstName: firstName,
          middleName: lastName,
          lastName: lastName,
          scope: "application_scope",
        }),
      });

      if (response.ok) {
        navigate("/email_notification?typePage=ConfirmEmail");
      }

      if (!response.ok) {
        throw new Error("Register failed");
      }

      console.log("Register successful");
    } catch (error) {
      console.error("Error register:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item sx={boxSection}>
        <Paper
          sx={{ ...paperSection, ...registerContainerStyle }}
          elevation={10}
        >
          <Typography
            style={{
              fontSize: "23px",
              fontWeight: "bold",
            }}
          >
            Create a new account
          </Typography>
          <Divider sx={lineUpStyle} />
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Box style={{ marginRight: "5px" }}>
              <TextField
                type="lastName"
                value={lastName}
                onChange={handleLastNameChange}
                onBlur={() => validateLastName(lastName)}
                label="Last name"
                fullWidth
                error={!!lastNameError}
                helperText={lastNameError}
              />
            </Box>
            <Box style={{ marginLeft: "5px" }}>
              <TextField
                type="firstName"
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={() => validateFirstName(firstName)}
                label="First name"
                fullWidth
                error={!!firstNameError}
                helperText={firstNameError}
              />
            </Box>
          </Box>
          <Box
            style={{
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <TextField
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              label="Email"
              fullWidth
              error={!!emailError}
              helperText={emailError}
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
              type={isRevealPwd1 ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)}
              label="Password"
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
              onBlur={() => validateConfirmPassword(password, confirmPassword)}
              label="Confirm password"
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
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link to="/">
              <Button variant="contained" sx={cancelButtonStyle}>
                Cancel
              </Button>
            </Link>
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
              sx={registerButtonStyle}
            >
              {loading ? "Register..." : "Register"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const registerContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const registerButtonStyle = {
  textTransform: "unset",
  height: "44.5px",
  flex: "1",
  margin: "0 0 0 10px",
  backgroundColor: "#2E8B57",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#25764F",
  },
};

const cancelButtonStyle = {
  textTransform: "unset",
  flex: "1",
  height: "44.5px",
  backgroundColor: "#ccc",
  color: "#000",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#bbb",
  },
};

const lineUpStyle = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
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

const boxSection = {
  flex: 1,
  height: "100%",
};

const paperSection = {
  paddingLeft: "16px",
  paddingRight: "16px",
  height: "100%",
};
export default Register;
