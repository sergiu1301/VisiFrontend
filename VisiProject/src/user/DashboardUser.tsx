import React, { CSSProperties, useEffect, useState } from "react";
import {
  Button,
  Grid,
  Box,
  Container,
  Menu,
  MenuItem,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import AvatarDropdown from "./AvatarDropdown.tsx";
import UsersDropdown from "./UsersDropdown.tsx";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Conversation from "./Conversation.tsx";
import { grey } from "@mui/material/colors";
import GroupMembersDialog from "./GroupMembersDialog.tsx";
import { Video } from "lucide-react";
import MessageInput from "./MessageInput.tsx";
import ChatPlaceHolder from "./ChatPlaceHolder.tsx";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import { Message } from "@mui/icons-material";
import MessageContainer from "./MessageContainer.tsx";
import GridLoader from "react-spinners/GridLoader";
import { useUserProfile } from "../UserProfileProvider.tsx";
import { useWebSocket } from "../WebSocketProvider.tsx";

interface Conversation {
  conversationId: string;
  adminId: string;
  groupName: string;
  creationTimeUnix: number;
  senderId: string;
  isOnline: true | false;
  lastMessage: Message;
  isGroup: false;
  userConversations: any;
}

interface Message {
  messageId: string;
  content: string;
  senderId: string;
  messageType: string;
  conversationId: string;
  creationTimeUnix: number;
}

const DashboardUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const queryClient = useQueryClient();
  const [typePage, setTypePage] = useState<string | null>("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const { userProfile } = useUserProfile();
  const { logout } = useWebSocket();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/chathub`, {
        accessTokenFactory: () => localStorage.getItem("jwtToken") || "",
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => console.log("Connected to SignalR Hub"))
        .catch((error: any) =>
          console.log("SignalR Hub connection error: ", error),
        );

      connection.on("ReceiveMessage", (message: any) => {
        console.log(message);
        setNewMessage(message);
        setSelectedConversation((prevConversation) => ({
          ...prevConversation,
          lastMessage: message,
        }));
        queryClient.invalidateQueries(["conversations", userProfile?.userId]);
      });
    }
  }, [connection]);

  useEffect(() => {
    if (connection && selectedConversation) {
      connection
        .invoke("AddToGroup", selectedConversation?.conversationId)
        .then(() =>
          console.log(`Joined group ${selectedConversation?.conversationId}`),
        )
        .catch((error: any) =>
          console.error(
            `Failed to join group ${selectedConversation?.conversationId}: `,
            error,
          ),
        );

      return () => {
        connection
          .invoke("RemoveFromGroup", selectedConversation?.conversationId)
          .then(() =>
            console.log(`Left group ${selectedConversation?.conversationId}`),
          )
          .catch((error: any) =>
            console.error(
              `Failed to leave group ${selectedConversation?.conversationId}: `,
              error,
            ),
          );
      };
    }
  }, [connection, selectedConversation]);

  const fetchValidationToken = async () => {
    try {
      if (token) {
        const response = await fetch(`${apiUrl}/connect/token/validate`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token is not valid");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      navigate("/");
      console.error(`Aici e eroarea ${error}`);
    }
  };

  useQuery("validateToken", () => fetchValidationToken());
  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (newMessage: Message) => {
    setNewMessage(newMessage);
    if (selectedConversation) {
      setSelectedConversation((prevConversation) => ({
        ...prevConversation,
        lastMessage: newMessage,
      }));
      queryClient.invalidateQueries(["conversations", userProfile?.userId]);
    }
  };

  const fetchConversations = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/conversation`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve conversations");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error retrieving conversation:", error);
      throw error;
    }
  };

  const {
    data: conversations,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
  } = useQuery(
    ["conversations", userProfile?.userId],
    () => fetchConversations(),
    { enabled: userProfile?.isOnline === true },
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const typePageFromUrl = searchParams.get("typePage");

        setTypePage(typePageFromUrl);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleAdmin = () => {
    navigate("/dashboard_admin/manage?type=Users");
  };

  const handleConversationCreated = async () => {
    await queryClient.invalidateQueries(["conversations", userProfile?.userId]);
  };

  const filteredConversations = conversations?.filter(
    (conversation: Conversation) =>
      conversation.groupName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSendClick = async () => {
    try {
      if (token) {
        const response = await fetch(
          `${apiUrl}/api/v1/conversation/${selectedConversation?.conversationId}`,
          {
            method: "PUT",
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Token is not valid");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      navigate("/");
      console.error(`Aici e eroarea ${error}`);
    }
  };

  if (userProfile !== null && typePage === null) {
    return (
      <Grid container height="100vh" width="100vw">
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Container maxWidth="md" sx={logoContainerStyle}></Container>
          </Grid>
          <Grid item xs={12} container justifyContent="flex-end">
            <PopupState
              variant="popover"
              popupId="demo-popup-menu"
              disableAutoFocus={false}
            >
              {(popupState) => (
                <React.Fragment>
                  <Button sx={menuButtonStyle} {...bindTrigger(popupState)}>
                    <MenuIcon style={{ fontSize: "35px" }} />
                  </Button>
                  <Menu {...bindMenu(popupState)}>
                    {userProfile && userProfile.roleName === "admin" && (
                      <MenuItem onClick={handleAdmin}>Admin</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </React.Fragment>
              )}
            </PopupState>
          </Grid>
          <Divider sx={{ ...lineUpStyle, marginBottom: "15px" }} />
          <Grid
            container
            spacing={2}
            sx={{ ...userProfileContainer, maxHeight: "93vh" }}
          >
            <Grid item xs={12} md={3} sx={boxSection}>
              <Paper sx={paperSection} elevation={10}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: "100%",
                    marginX: -2,
                  }}
                >
                  <Container sx={spaceContainerLeftStyle}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <AvatarDropdown></AvatarDropdown>
                      <UsersDropdown
                        onConversationCreated={handleConversationCreated}
                      ></UsersDropdown>
                    </Box>
                  </Container>
                  <Divider sx={lineUpStyle} />
                  <Container maxWidth={false} sx={searchContainerStyle}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search or start a new chat"
                      sx={{ pt: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        onChange: (e) => setSearchTerm(e.target.value),
                      }}
                    />
                    <IconButton
                      aria-label="filter list"
                      sx={{ ...buttonStyle, mt: 2 }}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Container>
                  <Container
                    sx={{
                      ...conversationContainerStyle,
                      marginX: 10,
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {filteredConversations?.map(
                      (conversation: Conversation) => (
                        <Conversation
                          key={conversation.conversationId}
                          conversation={conversation}
                          onClick={async () => {
                            await handleSelectConversation(conversation);
                          }}
                        />
                      ),
                    )}
                    {filteredConversations?.length === 0 && (
                      <>
                        <Typography
                          align="center"
                          sx={{ color: grey[500] }}
                          variant="body2"
                          mt={3}
                        >
                          No conversations yet
                        </Typography>
                        <Typography
                          align="center"
                          sx={{ color: grey[500] }}
                          variant="body2"
                          mt={3}
                        >
                          We understand {"you're"} an introvert, but {"you've"}{" "}
                          got to start somewhere 😊
                        </Typography>
                      </>
                    )}
                    {isConversationsError && (
                      <>
                        {" "}
                        <Box>Error fetching data</Box>{" "}
                      </>
                    )}
                    {isConversationsLoading && (
                      <>
                        <Box
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "70vh",
                          }}
                        >
                          <GridLoader
                            color="#3CB371"
                            loading={isConversationsLoading}
                            cssOverride={override}
                            size={20}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        </Box>
                      </>
                    )}
                  </Container>
                </Box>
              </Paper>
            </Grid>
            {selectedConversation ? (
              <Grid item xs={12} md={8} sx={boxSection}>
                <Paper sx={paperSection} elevation={10}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Container sx={spaceContainerRightStyle}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Box sx={avatarStyle}>
                          <GroupMembersDialog
                            selectedConversation={selectedConversation}
                          />
                        </Box>
                        <IconButton
                          aria-label="video"
                          sx={{
                            ...buttonStyle,
                            ...iconButtonStyle,
                          }}
                        >
                          <Video />
                        </IconButton>
                      </Box>
                    </Container>
                    <Divider sx={lineUpStyle}></Divider>
                    <Box id="messageContainer" sx={{ flex: 1 }}>
                      <MessageContainer
                        conversationId={selectedConversation.conversationId}
                        userProfile={userProfile}
                        token={token}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        connection={connection}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <MessageInput
                        selectedConversation={selectedConversation}
                        onSendMessage={handleSendMessage}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ) : (
              <ChatPlaceHolder />
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
};

const avatarStyle = {
  position: "absolute",
  left: "0",
  top: "50%",
  transform: "translateY(-50%)",
};

const iconButtonStyle = {
  position: "absolute",
  right: "0",
  top: "50%",
  transform: "translateY(-50%)",
};

const menuButtonStyle = {
  backgroundColor: "transparent",
  color: "#888",
  cursor: "pointer",
  marginTop: "-1.5%",
  fontSize: "1.5rem",
  padding: "10px",
};

const searchContainerStyle = {
  display: "flex",
  alignItems: "center",
  marginLeft: 2,
  marginBottom: "10px",
};

const userProfileContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  height: "93%",
};

const logoContainerStyle = {
  marginBottom: "-35px",
  textAlign: "center",
  alignContent: "center",
  height: "60px",
  backgroundColor: "transparent",
};

const spaceContainerLeftStyle = {
  textAlign: "center",
  alignContent: "center",
  height: "70px",
  backgroundColor: "transparent",
};

const spaceContainerRightStyle = {
  textAlign: "center",
  alignContent: "center",
  height: "70px",
  backgroundColor: "transparent",
  position: "relative",
};

const lineUpStyle = {
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

const buttonStyle = {
  backgroundColor: "transparent",
  color: "#aa",
  cursor: "pointer",
  alignContent: "center",
};

const conversationContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
};

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export default DashboardUser;
