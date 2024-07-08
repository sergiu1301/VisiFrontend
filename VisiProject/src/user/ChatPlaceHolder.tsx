import { Box, Grid, Paper, Typography } from "@mui/material";

const ChatPlaceHolder = () => {
  return (
    <Grid item xs={12} md={8} sx={boxSection}>
      <Paper sx={paperSection} elevation={10}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography>Select a conversation to view messages</Typography>
        </Box>
      </Paper>
    </Grid>
  );
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

export default ChatPlaceHolder;
