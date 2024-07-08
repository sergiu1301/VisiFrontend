import React, { useEffect, useState } from "react";
import checkImg from "../assets/new-checked.svg";
import { Box, Button, Grid, Divider, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const SuccessNotification: React.FC = () => {
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

  return (
    <Grid container spacing={2}>
      <Grid item sx={boxSection}>
        <Paper
          sx={{ ...paperSection, ...emailConfirmedContainerStyle }}
          elevation={10}
        >
          {typePage === "ConfirmEmail" && (
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Your email is confirmed
            </Typography>
          )}
          {typePage === "ResetPassword" && (
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Your password has been reset
            </Typography>
          )}
          <Divider sx={lineUpStyle} />
          <img
            src={checkImg}
            alt="Not confirmed email"
            style={{ width: "20%", height: "auto" }}
          />
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
};

const emailConfirmedContainerStyle = {
  width: "400px",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
};

const lineUpStyle = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

const loginButtonStyle = {
  textTransform: "unset",
  backgroundColor: "transparent",
  color: "#2E8B57",
  textAlign: "right",
  width: "150px",
  cursor: "pointer",
  fontSize: "15px",
  marginTop: "7px",
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

export default SuccessNotification;
