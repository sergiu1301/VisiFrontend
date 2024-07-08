import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  Paper,
  Grid,
} from "@mui/material";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/v1/user/forgot-password`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error("Register failed");
      }

      if (response.ok) {
        navigate("/email_notification?typePage=ResetPassword");
      }
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
          sx={{ ...paperSection, ...forgotPasswordContainerStyle }}
          elevation={10}
        >
          <Typography
            style={{
              fontSize: "23px",
              fontWeight: "bold",
            }}
          >
            Forgot Password
          </Typography>
          <Divider sx={lineUpStyle} />
          <Box style={{ marginBottom: "20px" }}>
            <Typography
              style={{
                fontSize: "15px",
                display: "block",
                textAlign: "left",
                marginBottom: "12px",
                width: "auto",
              }}
            >
              Please enter your email to search for your account.
            </Typography>
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
              onClick={handleForgotPassword}
              disabled={loading}
              sx={resetPasswordButtonStyle}
            >
              {loading ? "Reset Password..." : "Reset Password"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const forgotPasswordContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const cancelButtonStyle = {
  textTransform: "unset",
  flex: "1",
  backgroundColor: "#ccc",
  color: "#000",
  height: "44.5px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#bbb",
  },
};

const resetPasswordButtonStyle = {
  textTransform: "unset",
  flex: "1",
  margin: "0 0 0 10px",
  height: "44.5px",
  backgroundColor: "#2E8B57",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#25764F",
  },
};

const lineUpStyle = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
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
export default ForgotPassword;
