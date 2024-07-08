import React, { useEffect, useState } from "react";
import checkImg from "../assets/new-cancel.svg";
import { Box, Paper, Grid, Divider, Typography } from "@mui/material";

const NoSuccessNotification: React.FC = () => {
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
          sx={{ ...paperSection, ...emailNotConfirmedContainerStyle }}
          elevation={10}
        >
          {typePage === "ConfirmEmail" && (
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Your email is not confirmed
            </Typography>
          )}
          {typePage === "ResetPassword" && (
            <Typography
              style={{
                fontSize: "23px",
                fontWeight: "bold",
              }}
            >
              Your password has not been reset
            </Typography>
          )}
          <Divider sx={lineUpStyle} />
          <img
            src={checkImg}
            alt="Not Success email"
            style={{ width: "20%", height: "auto" }}
          />
          <Box>
            <Typography
              style={{
                marginTop: "15px",
                marginBottom: "5px",
              }}
              color="error"
            >
              Please try again later
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const emailNotConfirmedContainerStyle = {
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

const boxSection = {
  flex: 1,
  height: "100%",
};

const paperSection = {
  paddingLeft: "16px",
  paddingRight: "16px",
  height: "100%",
};

export default NoSuccessNotification;
