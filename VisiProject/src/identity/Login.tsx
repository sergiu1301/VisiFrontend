import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Box,
  Paper,
  Grid,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useQuery } from "react-query";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useWebSocket } from "../WebSocketProvider.tsx";
import { useUserProfile } from "../UserProfileProvider.tsx";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRevealPwd, setIsRevealPwd] = useState<boolean>(false);
  const { setAuthenticated } = useWebSocket();
  const { setUserProfile } = useUserProfile();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchValidationToken = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (token) {
        const response = await fetch(`${apiUrl}/connect/token/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token is not valid");
        }

        const responseProfile = await fetch(`${apiUrl}/api/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!responseProfile.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const responseType = await responseProfile.json();
        setUserProfile(responseType);

        if (responseType.roleName === "admin") {
          setAuthenticated(true);
          navigate("/dashboard_admin/manage?type=Users");
        } else if (responseType.roleName === "user") {
          setAuthenticated(true);
          navigate("/dashboard_user/manage_rooms");
        }
      }
    } catch (error) {
      localStorage.removeItem("jwtToken");
      console.log(error);
    }
  };

  useQuery("validateToken", fetchValidationToken);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleGoogleResponse = async (res: CredentialResponse) => {
    localStorage.setItem("jwtToken", res.credential as string);
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/connect/token/google`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${res.credential}`,
        },
      });

      const jwtToken = await response.text();

      if (!response.ok) {
        setErrorMessage("Invalid email or password.");
      }

      const responseProfile = await fetch(`${apiUrl}/api/v1/user`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!responseProfile.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const responseType = await responseProfile.json();
      setUserProfile(responseType);

      setErrorMessage("");
      localStorage.setItem("jwtToken", jwtToken);
      console.log("Login successful");

      if (responseType.roleName === "admin") {
        setAuthenticated(true);
        navigate("/dashboard_admin/manage?type=Users");
      } else if (responseType.roleName === "user") {
        setAuthenticated(true);
        navigate("/dashboard_user/manage_rooms");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Oops, something's wrong. Please come back later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/connect/token`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          scope: "application_scope",
        }),
      });

      const jwtToken = await response.text();
      if (!response.ok) {
        setErrorMessage("Invalid email or password.");
      }
      const responseProfile = await fetch(`${apiUrl}/api/v1/user`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!responseProfile.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const responseType = await responseProfile.json();
      setUserProfile(responseType);
      setErrorMessage("");
      localStorage.setItem("jwtToken", jwtToken);
      console.log("Login successful");

      if (responseType.roleName === "admin") {
        setAuthenticated(true);
        navigate("/dashboard_admin/manage?type=Users");
      } else if (responseType.roleName === "user") {
        setAuthenticated(true);
        navigate("/dashboard_user/manage_rooms");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Oops, something's wrong. Please come back later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item sx={boxSection}>
        <Paper sx={{ ...paperSection, ...loginContainerStyle }} elevation={10}>
          <Box>
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Log Into Visi
            </Typography>
            <Divider sx={lineUpStyle} />
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
                label="Enter your email"
                fullWidth
              />
            </Box>
            <Box
              style={{
                width: "100%",
                marginBottom: "20px",
              }}
            >
              <Box
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  position: "relative",
                }}
              >
                <TextField
                  type={isRevealPwd ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  label="Enter your password"
                  fullWidth
                />
                {password.length > 0 && (
                  <IconButton
                    sx={eyeButtonStyle}
                    onClick={() => setIsRevealPwd((prevState) => !prevState)}
                  >
                    {isRevealPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )}
              </Box>
            </Box>
            <Box style={{ marginBottom: "10px" }}>
              <Typography style={{ fontWeight: "initial" }} color="error">
                {errorMessage}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={loginButtonStyle}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <Box style={{ marginTop: "10px" }}>
              <Link to="/forgot_password" style={{ textDecoration: "none" }}>
                <Button
                  color="primary"
                  variant="text"
                  sx={forgotPasswordButtonStyle}
                >
                  Forgot Password?
                </Button>
              </Link>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <Button color="primary" variant="text" sx={signUpButtonStyle}>
                  Sign up for Visi
                </Button>
              </Link>
            </Box>
            <Box style={{ display: "flex", alignItems: "center" }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography sx={{ mx: 2, color: "text.secondary" }}>
                or
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>
            <Box
              style={{
                marginTop: "10px",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              <GoogleLogin onSuccess={handleGoogleResponse} />
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const loginContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const loginButtonStyle = {
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

const forgotPasswordButtonStyle = {
  textTransform: "unset",
  fontSize: "13px",
  backgroundColor: "transparent",
  color: "#2E8B57",
  textAlign: "right",
  width: "150px",
  paddingRight: "0",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "transparent",
    color: "#1F6D42",
  },
};

const signUpButtonStyle = {
  textTransform: "unset",
  fontSize: "13px",
  backgroundColor: "transparent",
  color: "#2E8B57",
  textAlign: "left",
  width: "150px",
  paddingLeft: "0",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "transparent",
    color: "#1F6D42",
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
export default Login;
