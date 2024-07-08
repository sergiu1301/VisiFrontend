import React from "react";
import { Container, Typography, Box } from "@mui/material";

const PageNotFound: React.FC = () => {
  return (
    <Box>
      <Container sx={pageNotFoundContainerStyle}>
        <Box>
          <Typography
            color="red"
            variant="h3"
            style={{
              fontWeight: "bold",
            }}
          >
            404 Error
          </Typography>
          <Typography
            style={{
              fontSize: "23px",
              fontWeight: "bold",
            }}
          >
            Page Not Found
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const pageNotFoundContainerStyle = {
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
};
export default PageNotFound;
