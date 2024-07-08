import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Button,
  Box,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import UserBox from "./UserBox.tsx";
import CloseIcon from "@mui/icons-material/Close";
import { useQueryClient } from "react-query";

const UsersDropdown = ({ onConversationCreated }) => {
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const rowsPerPage = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const token = localStorage.getItem("jwtToken");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchUsers = async (pageNumber, append = false) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      console.log(searchQuery);
      const response = await fetch(
        `${apiUrl}/api/v1/admin/users?pageNumber=${pageNumber}&pageSize=${rowsPerPage}`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(searchQuery),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.users.length < rowsPerPage) {
        setHasMore(false);
      }
      setUsers((prevUsers) =>
        append ? [...prevUsers, ...data.users] : data.users,
      );

      queryClient.setQueryData(["usersList", searchQuery], (old) => {
        return {
          users: append ? [...(old?.users || []), ...data.users] : data.users,
          pageNumber,
          hasMore: data.users.length === rowsPerPage,
        };
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const createConversation = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const finalGroupName = groupName || `Group ${selectedUsers.length}`;

      const response = await fetch(`${apiUrl}/api/v1/conversation`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupName: finalGroupName,
          creationTimeUnix: Math.floor(Date.now() / 1000),
          isOnline: true,
          userConversationIds: selectedUsers.map(
            (user: { userId: string; userName: string }) => user.userId,
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      onConversationCreated(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    setPageNumber(1);
    setHasMore(true);
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchQuery]);

  const handleOpenSettings = () => {
    setOpenSettingsDialog(true);
    setSelectedUsers([]);
    setPageNumber(1);
    setHasMore(true);
    setSearchQuery("");
    setGroupName("");

    const cachedData = queryClient.getQueryData(["usersList", ""]);
    if (cachedData) {
      console.log(cachedData);
      setUsers(cachedData.users);
      setPageNumber(cachedData.pageNumber);
      setHasMore(cachedData.hasMore);
    } else {
      fetchUsers(1);
    }
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
  };

  const handleUserSelect = (user) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(user)) {
        return prevSelectedUsers.filter((u) => u !== user);
      } else {
        return [...prevSelectedUsers, user];
      }
    });
  };

  const handleSaveButtonClick = async () => {
    await createConversation();
    setOpenSettingsDialog(false);
  };

  const handleScroll = () => {
    const container = listRef.current;
    if (
      container?.scrollTop + container?.clientHeight >=
        container?.scrollHeight - 100 &&
      hasMore
    ) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
      console.log(users);
    }
  };

  useEffect(() => {
    if (openSettingsDialog) {
      fetchUsers(pageNumber, pageNumber > 1);
    }
  }, [pageNumber, openSettingsDialog]);

  return (
    <div>
      <IconButton
        aria-label="add"
        sx={cancelButtonStyle}
        onClick={handleOpenSettings}
      >
        <AddIcon />
      </IconButton>
      <Dialog
        open={openSettingsDialog}
        onClose={handleCloseSettingsDialog}
        PaperProps={{
          sx: {
            width: "600px",
            maxWidth: "none",
            height: "500px",
          },
        }}
      >
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
        <TextField
          variant="outlined"
          placeholder="Search a user"
          sx={{ m: "10px", mt: "50px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {selectedUsers.length >= 2 && (
          <TextField
            variant="outlined"
            placeholder="Add a group name"
            sx={{ m: "10px" }}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        )}
        <Divider sx={lineUpStyle}></Divider>
        <Box
          sx={{ flex: 1, overflow: "auto", pb: 8 }}
          onScroll={handleScroll}
          ref={listRef}
        >
          <List>
            {users?.map((user: { userId: string; userName: string }) => (
              <ListItem key={user.userId}>
                <UserBox
                  user={user}
                  selected={selectedUsers.includes(user)}
                  searchQuery={searchQuery}
                  onSelect={() => handleUserSelect(user)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        {selectedUsers.length >= 1 && (
          <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
            <Button
              fullWidth
              sx={buttonStyle}
              variant="contained"
              color="primary"
              onClick={handleSaveButtonClick}
            >
              Create conversation
            </Button>
          </Box>
        )}
      </Dialog>
    </div>
  );
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

const cancelButtonStyle = {
  backgroundColor: "transparent",
  color: "#aa",
  cursor: "pointer",
  alignContent: "center",
};

const lineUpStyle = {
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

export default UsersDropdown;
