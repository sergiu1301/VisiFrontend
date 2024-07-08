import { Laugh, Mic, Plus, Send } from "lucide-react";
import {
  Container,
  Divider,
  IconButton,
  TextField,
  Popover,
} from "@mui/material";
import React, { useState } from "react";
import Picker, { EmojiClickData } from "emoji-picker-react";

const MessageInput = ({ selectedConversation, onSendMessage }) => {
  const [msgText, setMsgText] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const token = localStorage.getItem("jwtToken");
  const apiUrl = import.meta.env.VITE_API_URL;
  const sendMessage = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      let isOpenApiActive = false;
      if (selectedConversation.groupName === "OpenApi") {
        isOpenApiActive = true;
      }
      const response = await fetch(`${apiUrl}/api/v1/message`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: msgText,
          messageType: "text",
          conversationId: selectedConversation.conversationId,
          creationTimeUnix: Math.floor(Date.now() / 1000),
          openApiSupport: isOpenApiActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      onSendMessage(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsgText(event.target.value);
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setMsgText((prevText) => prevText + emojiObject.emoji);
    setAnchorEl(null);
  };

  const handleEmojiButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      await sendMessage();
      setMsgText("");
    }
  };

  const handleSendClick = async () => {
    try {
      await sendMessage();
      setMsgText(""); // Reset the input field after sending the message
    } catch (error) {
      console.error("Eroare la trimiterea mesajului:", error);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "emoji-popover" : undefined;

  return (
    <>
      <Divider sx={lineUpStyle} />
      <Container maxWidth={false} sx={inputContainerStyle}>
        <IconButton
          aria-label="filter list"
          sx={{ ...buttonStyle, mt: 2 }}
          onClick={handleEmojiButtonClick}
        >
          <Laugh />
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Picker onEmojiClick={handleEmojiClick} />
        </Popover>
        <IconButton aria-label="filter list" sx={{ ...buttonStyle, mt: 2 }}>
          <Plus />
        </IconButton>
        <TextField
          fullWidth
          type={"text"}
          variant="outlined"
          placeholder="Type a message"
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          value={msgText}
          sx={{ pt: 2 }}
        />
        {msgText.length > 0 ? (
          <IconButton
            aria-label="filter list"
            sx={{ ...buttonStyle, mt: 2 }}
            onClick={handleSendClick}
          >
            <Send />
          </IconButton>
        ) : (
          <IconButton aria-label="filter list" sx={{ ...buttonStyle, mt: 2 }}>
            <Mic />
          </IconButton>
        )}
      </Container>
    </>
  );
};

const inputContainerStyle = {
  display: "flex",
  alignItems: "center",
  marginLeft: 2,
};

const lineUpStyle = {
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

const buttonStyle = {
  backgroundColor: "transparent",
  color: "#aa",
  cursor: "pointer",
  alignContent: "center",
};

export default MessageInput;
