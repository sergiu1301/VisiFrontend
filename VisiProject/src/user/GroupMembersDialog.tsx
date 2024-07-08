import React, { useEffect, useState } from "react";
import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUserProfile } from "../UserProfileProvider.tsx";
import { useWebSocket } from "../WebSocketProvider.tsx";
import crown from "../assets/crown.svg";
const GroupMembersDialog = ({ selectedConversation }) => {
  const [open, setOpen] = useState(false);
  const { connection } = useWebSocket();
  const [members, setMembers] = useState<any>();

  useEffect(() => {
    setMembers(selectedConversation?.userConversations);
  }, [selectedConversation]);

  const groupName = selectedConversation.groupName || "Private Chat";
  const groupAdmin = selectedConversation.adminId;
  const { userProfile } = useUserProfile();
  const groupImage =
    selectedConversation.groupImage || "path_to_placeholder_image.jpg";
  const membersForGroup = selectedConversation?.userConversations?.filter(
    (member) => member.userId !== userProfile?.userId,
  );
  const handleClickOpen = () => {
    console.log(selectedConversation);
    console.log(members);
    console.log(membersForGroup);
    if (members?.length > 2) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (connection) {
      connection.on("UserOnlineStatusChanged", (userId, isOnline) => {
        console.log(`User ${userId} is now ${isOnline ? "online" : "offline"}`);
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.userId === userId ? { ...member, isOnline } : member,
          ),
        );
      });
    }

    return () => {
      if (connection) {
        connection.off("UserOnlineStatusChanged");
      }
    };
  }, [connection]);

  return (
    <div>
      <Box
        sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={handleClickOpen}
      >
        <Avatar
          alt={
            membersForGroup.length >= 2
              ? groupName
              : membersForGroup[0]?.userName
          }
          src={
            membersForGroup.length >= 2
              ? groupImage
              : membersForGroup[0]?.userName
          }
        />
        {members?.length > 2 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              flexDirection: "column",
              marginLeft: 2,
            }}
          >
            <Typography>
              {membersForGroup.length >= 2
                ? groupName
                : membersForGroup[0]?.userName}
            </Typography>
            <Typography
              sx={{ color: "grey", fontSize: "0.75rem" }}
              gutterBottom
            >
              {membersForGroup.length >= 2 ? "See members" : ""}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ marginLeft: 2 }}>
            {membersForGroup.length >= 2
              ? groupName
              : membersForGroup[0]?.userName}
          </Typography>
        )}
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Group Members
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
          <Grid container spacing={4}>
            {members?.map((member, index) => (
              <Grid item key={index} xs={4} sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {member?.userId === groupAdmin ? (
                    <img
                      src={crown}
                      alt="Admin"
                      style={{ width: "40px", height: "40px" }}
                    />
                  ) : (
                    <Box sx={{ height: "40px" }}></Box>
                  )}
                  <Avatar
                    sx={{
                      border: "1px solid #888",
                      overflow: "visible",
                      position: "relative",
                      margin: "0 auto",
                    }}
                  >
                    {member?.isOnline && (
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
                    <Avatar
                      alt={member?.userName}
                      src={member?.userName || "/placeholder.png"}
                      sx={{ width: 40, height: 40 }}
                    />
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {member?.userName}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
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

export default GroupMembersDialog;
