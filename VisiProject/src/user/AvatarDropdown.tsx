import React, { useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Divider,
  Stack,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SecurityIcon from "@mui/icons-material/Security";
import CloseIcon from "@mui/icons-material/Close";
import { useUserProfile } from "../UserProfileProvider";

const AvatarDropdown = () => {
  const { userProfile, setUserProfile } = useUserProfile();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const token = localStorage.getItem("jwtToken");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    if (event.target.value === userProfile?.userName) {
      setIsChanged(false);
    } else {
      setIsChanged(true);
    }
  };

  const handleFirstNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFirstname(event.target.value);
    if (event.target.value === userProfile?.firstName) {
      setIsChanged(false);
    } else {
      setIsChanged(true);
    }
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastname(event.target.value);
    if (event.target.value === userProfile?.lastName) {
      setIsChanged(false);
    } else {
      setIsChanged(true);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSettings = () => {
    setOpenSettingsDialog(true);
    setSelectedTab("account");
    handleClose();
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const fetchUserDetails = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/user`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: username === "" ? userProfile?.userName : username,
          firstName: firstname === "" ? userProfile?.firstName : firstname,
          lastName: lastname === "" ? userProfile?.lastName : lastname,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to change user details");
      }

      const user = await response.json();
      setUserProfile(user);
    } catch (error) {
      console.error("Error changing user details:", error);
      throw error;
    }
  };

  const fetchDeleteUserAccount = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/user`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await response.json();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const handleSaveButtonClick = async () => {
    setOpenSettingsDialog(false);
    await fetchUserDetails();
    setIsChanged(false);
  };

  const handleDeleteButtonClick = async () => {
    setOpenSettingsDialog(false);
    await fetchDeleteUserAccount();
    setIsChanged(false);
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userProfile?.email }),
      });

      if (!response.ok) {
        throw new Error("Forgot password request failed");
      }
    } catch (error) {
      console.error("Error with forgot password request:", error);
    }
  };

  const handleChangePasswordButtonClick = async () => {
    setOpenSettingsDialog(false);
    await handleForgotPassword();
    setIsChanged(false);
  };

  return (
    <div>
      <Avatar
        sx={{
          border: "1px solid #888",
          overflow: "visible",
          position: "relative",
        }}
        onClick={handleClick}
      >
        {userProfile?.isOnline && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              backgroundColor: "green",
              borderRadius: "50%",
              border: "2px solid white",
              zIndex: 1,
            }}
          />
        )}
        <Avatar alt={userProfile?.userName} src="/avatar.jpg" />
      </Avatar>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>{userProfile?.userName}</MenuItem>
        <MenuItem onClick={handleOpenSettings}>Manage Settings</MenuItem>
      </Menu>
      <Dialog
        open={openSettingsDialog}
        onClose={handleCloseSettingsDialog}
        PaperProps={{
          sx: {
            width: "800px",
            maxWidth: "none",
            height: "500px",
          },
        }}
      >
        <DialogTitle>
          Settings
          <IconButton
            aria-label="close"
            onClick={handleCloseSettingsDialog}
            sx={{
              ...cancelButtonStyle,
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={3} md={2}>
              <DialogActions
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "center",
                }}
              >
                <Stack direction="column" spacing={1}>
                  <Button
                    sx={buttonStyle}
                    onClick={() => handleTabChange("account")}
                    startIcon={<AccountCircleIcon />}
                  >
                    Account
                  </Button>
                  <Button
                    sx={buttonStyle}
                    onClick={() => handleTabChange("security")}
                    startIcon={<SecurityIcon />}
                  >
                    Security
                  </Button>
                </Stack>
              </DialogActions>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={8} md={8}>
              <DialogContent>
                {selectedTab === "account" ? (
                  <>
                    <Typography
                      sx={{ mt: "-20px", mb: 0 }}
                      variant="h4"
                      gutterBottom
                    >
                      Account
                    </Typography>
                    <Typography sx={{ mb: 3 }} color="grey" gutterBottom>
                      Manage your account settings
                    </Typography>
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Username
                      </Typography>
                      <TextField
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={
                          username === "" ? userProfile?.userName : username
                        }
                        onChange={handleUsernameChange}
                      />
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={userProfile?.email}
                        disabled
                      />
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={
                          firstname === "" ? userProfile?.firstName : firstname
                        }
                        onChange={handleFirstNameChange}
                      />
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={
                          lastname === "" ? userProfile?.lastName : lastname
                        }
                        onChange={handleLastNameChange}
                      />
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Email Confirmed
                      </Typography>
                      <TextField
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={`${userProfile?.emailConfirmed}`}
                        disabled
                      />
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        marginTop: "-20px",
                        marginBottom: "20px",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{ fontSize: "18px", fontWeight: "bold" }}
                        >
                          Password
                        </Typography>
                        <Typography sx={{ fontSize: "14px", width: "200px" }}>
                          You don't have set a password or you forgot your
                          password?
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, marginLeft: 2 }}>
                        <Button
                          fullWidth
                          sx={buttonStyle}
                          variant="contained"
                          color="primary"
                          onClick={handleChangePasswordButtonClick}
                        >
                          Change Password
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Box>
                        <Typography
                          sx={{ fontSize: "18px", fontWeight: "bold" }}
                        >
                          Delete your data and account
                        </Typography>
                        <Typography sx={{ fontSize: "14px", width: "200px" }}>
                          Permanently delete your data and all items associated
                          with your account
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, marginLeft: 2 }}>
                        <Button
                          fullWidth
                          sx={buttonStyle}
                          variant="contained"
                          color="primary"
                          onClick={handleDeleteButtonClick}
                        >
                          Delete Account
                        </Button>
                      </Box>
                    </Box>
                    {isChanged && (
                      <Box
                        sx={{
                          mt: 5,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          fullWidth
                          sx={buttonStyle}
                          variant="contained"
                          color="primary"
                          onClick={handleSaveButtonClick}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </>
                ) : selectedTab === "security" ? (
                  <>
                    <Typography
                      sx={{ mt: "-20px", mb: 0 }}
                      variant="h4"
                      gutterBottom
                    >
                      Security
                    </Typography>
                    <Typography sx={{ mb: 3 }} color="grey" gutterBottom>
                      Security settings
                    </Typography>
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Role
                      </Typography>
                      <Typography
                        sx={{ cursor: "pointer" }}
                        color="grey"
                        fontSize={14}
                      >
                        {userProfile?.roleName}
                      </Typography>
                    </Box>
                    <Divider sx={lineUpStyle} />
                    <Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                        Role Description
                      </Typography>
                      <Typography
                        sx={{ cursor: "pointer" }}
                        color="grey"
                        fontSize={14}
                      >
                        {userProfile?.roleDescription}
                      </Typography>
                    </Box>
                  </>
                ) : null}
              </DialogContent>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const lineUpStyle = {
  marginBottom: "30px",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

const cancelButtonStyle = {
  backgroundColor: "transparent",
  color: "#aa",
  cursor: "pointer",
  alignContent: "center",
  "&:hover": {
    backgroundColor: "transparent",
    color: "black",
  },
};

const buttonStyle = {
  textTransform: "unset",
  backgroundColor: "#2E8B57",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#25764F",
  },
};

export default AvatarDropdown;
