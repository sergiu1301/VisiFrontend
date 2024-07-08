import { Box, Divider, Avatar, Typography, Grid } from "@mui/material";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { MessageSeenSvg } from "../lib/svgs.tsx";
import { useUserProfile } from "../UserProfileProvider.tsx";
import { format, isToday, isThisWeek, isYesterday } from "date-fns";

const formatMessageDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date, { weekStartsOn: 1 })) {
    const dayOfWeek = format(date, "EEEE");
    return dayOfWeek;
  } else {
    return format(date, "dd-MM-yyyy");
  }
};
const Conversation = ({
  conversation,
  onClick,
}: {
  conversation: {
    conversationId: string;
    adminId: string;
    groupName: string;
    creationTimeUnix: number;
    senderId: string;
    isOnline: true | false;
    lastMessage: any;
    isGroup: true | false;
    userConversations: any;
  };
  onClick: () => void;
}) => {
  const conversationImage = conversation.groupName;
  const conversationName = conversation.groupName || "Private Chat";
  const lastMessage = conversation.lastMessage;
  const lastMessageType = lastMessage?.messageType;
  const { userProfile } = useUserProfile();
  const members = conversation?.userConversations?.filter(
    (member) => member.userId !== userProfile?.userId,
  );
  return (
    <>
      <Box
        onClick={onClick}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={3}
        sx={{
          width: "100%",
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
            cursor: "pointer",
          },
        }}
      >
        <Avatar
          sx={{
            border: "1px solid #888",
            overflow: "visible",
            position: "relative",
          }}
        >
          {members.length >= 2 && conversation.isOnline && (
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
          {members.length == 1 && members[0].isOnline && (
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
            alt={members.length >= 2 ? conversationName : members[0]?.userName}
            src={
              members.length >= 2
                ? conversationImage
                : members[0]?.userName || "/placeholder.png"
            }
            sx={{ width: 40, height: 40 }}
          />
        </Avatar>
        <Box flexGrow={1} ml={2}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1">
                {members.length >= 2 ? conversationName : members[0]?.userName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" align="left">
                {formatMessageDate(
                  lastMessage?.creationTimeUnix ||
                    conversation.creationTimeUnix,
                )}
              </Typography>
            </Grid>
          </Grid>
          <Box
            display="flex"
            alignItems="center"
            mt={1}
            fontSize="0.75rem"
            color="text.secondary"
          >
            {lastMessage?.senderId === userProfile?.userId && (
              <MessageSeenSvg />
            )}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && "Say Hi!"}
            {lastMessageType === "text" ? (
              lastMessage?.content.length > 30 ? (
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lastMessage?.content.slice(0, 30)}...
                </Typography>
              ) : (
                <Typography variant="body2">{lastMessage?.content}</Typography>
              )
            ) : null}
            {lastMessageType === "image" && <ImageIcon size={16} />}
            {lastMessageType === "video" && <VideoIcon size={16} />}
          </Box>
        </Box>
      </Box>
      <Divider sx={lineUpStyle} />
    </>
  );
};

const lineUpStyle = {
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

export default Conversation;
