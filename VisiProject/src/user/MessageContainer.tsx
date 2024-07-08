import React, { useState, useEffect, useRef, CSSProperties } from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { MessageSeenSvg } from "../lib/svgs.tsx";
import GridLoader from "react-spinners/GridLoader";
import axios from "axios";
import "./MessageContainer.css";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Simulate } from "react-dom/test-utils";
import contextMenu = Simulate.contextMenu;

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/*const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};*/

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date, { weekStartsOn: 1 })) {
    const dayOfWeek = format(date, "EEEE");
    return dayOfWeek;
  } else {
    return format(date, "dd-MM-yyyy");
  }
};

const linkify = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: white;">${url}</a>`;
  });
};

interface Message {
  messageId: string;
  content: string;
  sender: any;
  senderId: string;
  messageType: string;
  conversationId: string;
  creationTimeUnix: number;
}

const fetchMessages = async (pageNumber, conversationId, token) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await axios.get(
    `${apiUrl}/api/v1/message?conversationId=${conversationId}&pageNumber=${pageNumber}&pageSize=100`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

const MessageContainer = ({
  conversationId,
  userProfile,
  token,
  newMessage,
  setNewMessage,
  connection,
}) => {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      setInitialLoading(true);
      const messages = await fetchMessages(1, conversationId, token);
      setCurrentMessages(messages);
      setInitialLoading(false);
      setPageNumber(2);
      setHasMore(messages.length === 7);
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    loadMessages();
  }, [conversationId, token]);

  useEffect(() => {
    setCurrentMessages([]);
    setPageNumber(1);
    setHasMore(true);
    setNewMessage(null);
  }, [conversationId]);

  useEffect(() => {
    if (newMessage) {
      setCurrentMessages((prevMessages) => {
        if (
          prevMessages.some((msg) => msg.messageId === newMessage.messageId)
        ) {
          return prevMessages;
        }
        const allMessages = [...prevMessages, newMessage].sort(
          (a, b) => a.creationTimeUnix - b.creationTimeUnix,
        );
        return allMessages;
      });
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [newMessage, isAtBottom]);

  useEffect(() => {
    if (connection) {
      connection.on("MessageDeleted", (messageId: string) => {
        setCurrentMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.messageId !== messageId),
        );
      });
    }
  }, [connection]);

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (container) {
      setIsAtBottom(
        container.scrollHeight - container.scrollTop === container.clientHeight,
      );
      if (container.scrollTop === 0 && hasMore) {
        setPreviousScrollHeight(container.scrollHeight);
        const newMessages = await fetchMessages(
          pageNumber,
          conversationId,
          token,
        );
        setCurrentMessages((prevMessages) => [...newMessages, ...prevMessages]);
        setHasMore(newMessages.length === 7);
        setPageNumber(pageNumber + 1);
      }
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && previousScrollHeight) {
      container.scrollTop = container.scrollHeight - previousScrollHeight;
      setPreviousScrollHeight(0);
    }
  }, [currentMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasMore, pageNumber, conversationId, token]);

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/v1/message/${selectedMessage.messageId}/conversation/${conversationId}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCurrentMessages((prevMessages) =>
          prevMessages.filter(
            (msg) => msg.messageId !== selectedMessage.messageId,
          ),
        );
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
      setContextMenu(null);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleRightClick = (event, message) => {
    event.preventDefault();
    setSelectedMessage(message);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null,
    );
  };

  const shouldShowAvatarAndTail = (
    currentMessage: Message,
    index: number,
  ): boolean => {
    if (index === 0) return true;
    const previousMessage = currentMessages[index - 1];
    return (
      currentMessage.senderId !== previousMessage.senderId /*||
      currentMessage.creationTimeUnix - previousMessage.creationTimeUnix > 30*/
    );
  };

  const shouldShowDate = (currentMessage: Message, index: number): boolean => {
    if (index === 0) return true;
    const previousMessage = currentMessages[index - 1];
    const currentDate = new Date(currentMessage.creationTimeUnix * 1000);
    const previousDate = new Date(previousMessage.creationTimeUnix * 1000);
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };
  return (
    <Box
      ref={messagesContainerRef}
      className="scrollable-container"
      sx={{
        marginX: -4,
        position: "relative",
        padding: 3,
        flex: 1,
        overflowY: !initialLoading ? "auto" : "hidden",
        width: "100%",
        maxHeight: "66vh",
      }}
    >
      {initialLoading ? (
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
            loading={initialLoading}
            cssOverride={override}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </Box>
      ) : (
        <Box className="message-box">
          {currentMessages.map((msg, index) => {
            const isUserProfile = msg.senderId === userProfile.userId;
            const formattedTime = formatTimestamp(msg.creationTimeUnix);
            const formattedDate = formatDate(msg.creationTimeUnix);
            const showAvatarAndTail = shouldShowAvatarAndTail(msg, index);
            const showDate = shouldShowDate(msg, index);

            const messageContent = msg.content.match(/(https?:\/\/[^\s]+)/g)
              ? linkify(msg.content)
              : msg.content;

            return (
              <React.Fragment key={msg.messageId}>
                {showDate && (
                  <Box className="date-divider">
                    <Typography>{formattedDate}</Typography>
                  </Box>
                )}
                <Box
                  className={`message-row ${isUserProfile ? "user" : "other"}`}
                  sx={{
                    marginLeft:
                      !showAvatarAndTail && !isUserProfile ? "70px" : "30px", // Adjust margin when avatar is not shown
                  }}
                >
                  {showAvatarAndTail && !isUserProfile && (
                    <Tooltip title={msg.sender?.userName}>
                      <Avatar
                        alt={msg.sender?.userName}
                        src={msg.sender?.userName}
                        sx={{
                          marginBottom: 1,
                          width: 40,
                          height: 40,
                        }}
                      />
                    </Tooltip>
                  )}
                  <Box
                    className={`message-bubble ${isUserProfile ? "user" : "other"} ${showAvatarAndTail ? "" : "no-tail"}`}
                    ref={isUserProfile ? messagesEndRef : null}
                    onContextMenu={(e) => handleRightClick(e, msg)}
                  >
                    {msg.content.match(/(https?:\/\/[^\s]+)/g) ? (
                      <Typography
                        sx={{
                          overflowWrap: "break-word",
                          color: "white",
                        }}
                        dangerouslySetInnerHTML={{ __html: messageContent }} // Render the message content with links
                      />
                    ) : (
                      <Typography
                        sx={{
                          overflowWrap: "break-word",
                          color: "white",
                        }}
                      >
                        {messageContent}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        alignItems: "center",
                        marginBottom: "-10px",
                        marginRight: "-10px",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          marginLeft: 0.5,
                          color: "white",
                          marginRight: "2px",
                        }}
                      >
                        {formattedTime}
                      </Typography>
                      <Box sx={{ marginRight: 1, color: "white" }}>
                        {isUserProfile && <MessageSeenSvg />}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      )}
      {selectedMessage && selectedMessage.senderId === userProfile.userId && (
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
        </Menu>
      )}
    </Box>
  );
};

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default MessageContainer;
