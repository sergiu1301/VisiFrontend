import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import envelopeImg from "../assets/envelope.svg";

const EmailNotification: React.FC = () => {
  const [typePage, setTypePage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const typePageFromUrl = searchParams.get("typePage");

        if (!typePageFromUrl) {
          throw new Error("Page not found");
        }

        setTypePage(typePageFromUrl);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  if (typePage == "ConfirmEmail" || typePage == "ResetPassword") {
    return (
      <Grid container spacing={2}>
        <Grid item sx={boxSection}>
          <Paper
            sx={{ ...paperSection, ...emailConfirmedContainerStyle }}
            elevation={10}
          >
            <Box>
              <img src={envelopeImg} alt="Logo" style={{ width: "20%" }} />
            </Box>
            <Box style={{ marginBottom: "20px", marginTop: "10px" }}>
              <Typography
                color="black"
                style={{
                  fontSize: "14px",
                  display: "block",
                  textAlign: "left",
                  marginTop: "12px",
                  width: "auto",
                }}
              >
                {typePage == "ConfirmEmail" && "Thank you for signing up."}
              </Typography>
              <Typography
                style={{
                  fontSize: "14px",
                  display: "block",
                  textAlign: "left",
                  width: "auto",
                }}
              >
                {typePage == "ConfirmEmail" &&
                  "An email for email verification has been successfully sent to your address. Please take a moment to check your inbox, as well as any spam or junk folders, to ensure you have received it."}
                {typePage == "ResetPassword" &&
                  "A reset password email has been successfully sent to your address. Please take a moment to check your inbox, as well as any spam or junk folders, to ensure you have received it."}
              </Typography>
            </Box>
            <Box>
              <Link to="/" style={{ textDecoration: "none" }}>
                <Button variant="text" sx={loginButtonStyle}>
                  Back to login page
                </Button>
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  }
};

const emailConfirmedContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const loginButtonStyle = {
  textTransform: "unset",
  backgroundColor: "transparent",
  color: "#2E8B57",
  textAlign: "right",
  width: "150px",
  cursor: "pointer",
  fontSize: "15px",
  "&:hover": {
    backgroundColor: "transparent",
    color: "#1F6D42",
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

export default EmailNotification;
