import React, { CSSProperties, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery, useQueryClient } from "react-query";
import GridLoader from "react-spinners/GridLoader";
import AvatarDropdown from "../user/AvatarDropdown.tsx";
import { useWebSocket } from "../WebSocketProvider.tsx";
import { useUserProfile } from "../UserProfileProvider.tsx";

type RoleType = string;

interface SelectedRoles {
  [userId: string]: RoleType;
}

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [context, setContext] = useState<"left" | "right">("left");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<SelectedRoles>({});
  const [roleDescription, setRoleDescription] = useState("");
  const token = localStorage.getItem("jwtToken");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { userProfile } = useUserProfile();
  const { logout } = useWebSocket();
  const apiUrl = import.meta.env.VITE_API_URL;

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

  const fetchUsers = async (page: number, rowsPerPage: number) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(
        `${apiUrl}/api/v1/admin/users?pageNumber=${page + 1}&pageSize=${rowsPerPage}`,
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

      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const fetchRoles = async () => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/roles`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  };

  const fetchDeleteUser = async (userId: string) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await queryClient.invalidateQueries("users");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const fetchAddUserRole = async (userId: string, roleName: string) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(
        `${apiUrl}/api/v1/admin/users/${userId}/role`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roleName),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add user role");
      }
    } catch (error) {
      console.error("Error adding user role:", error);
      throw error;
    }
  };

  const fetchDeleteRole = async (roleName: string) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/roles/${roleName}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      await queryClient.invalidateQueries("roles");
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  };

  const fetchEditRole = async (
    roleId: string,
    roleName: string,
    roleDescription: string,
  ) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roleName,
          description: roleDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit role");
      }

      await queryClient.invalidateQueries("roles");
    } catch (error) {
      console.error("Error editing role:", error);
      throw error;
    }
  };

  const fetchAddRole = async (roleName: string, roleDescription: string) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/roles`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roleName,
          description: roleDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      await queryClient.invalidateQueries("roles");
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  };

  const fetchBlockUnblockUser = async (userId: string, blocked: boolean) => {
    try {
      if (!token) {
        throw new Error("JWT token not found");
      }

      const response = await fetch(
        `${apiUrl}/api/v1/admin/users/${userId}/block`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(blocked),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      await queryClient.invalidateQueries("users");
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  };

  const {
    data: data,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetch,
  } = useQuery(
    ["users", page, rowsPerPage],
    () => fetchUsers(page, rowsPerPage),
    {
      cacheTime: 60000,
      staleTime: 300000,
    },
  );

  const {
    data: dataRoles,
    isLoading: isRolesLoading,
    isError: isRolesError,
  } = useQuery(["roles"], () => fetchRoles(), {
    cacheTime: 60000,
    staleTime: 300000,
  });

  useEffect(() => {
    const fetchData = async () => {
      await refetch();
    };

    fetchData();
  }, [searchQuery, refetch]);

  useEffect(() => {
    setSearchQuery("");
    setPage(0);
    setRowsPerPage(5);
    fetchUsers(0, 5);
  }, [context]);

  if (isUsersError || isRolesError) {
    return <Box>Error fetching data</Box>;
  }

  const handleCheckboxChange = (userId: string) => {
    const newSelectedRows = selectedRows.includes(userId)
      ? selectedRows.filter((id) => id !== userId)
      : [...selectedRows, userId];
    setSelectedRows(newSelectedRows);
  };

  const handleDeleteSelectedRows = async () => {
    for (const userId of selectedRows) {
      await fetchDeleteUser(userId);
    }
    setSelectedRows([]);
  };

  const handleRemoveUser = async (userId: string) => {
    setUserToDelete(userId);
    setOpenConfirmDialog(true);
  };

  const handleBlockUser = async (userId: string) => {
    await fetchBlockUnblockUser(userId, true);
  };

  const handleUnblockUser = async (userId: string) => {
    await fetchBlockUnblockUser(userId, false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleUser = () => {
    navigate("/dashboard_user/manage_rooms");
  };

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleRemoveRole = async (roleName: string) => {
    setRoleToDelete(roleName);
    setOpenConfirmDialog(true);
  };

  const handleAddNewRole = () => {
    setRoleName("");
    setRoleDescription("");
    setEditRole(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveRole = async () => {
    await fetchAddRole(roleName, roleDescription);
    setRoleName("");
    setRoleDescription("");
    setOpenModal(false);
  };

  const handleEditRole = async () => {
    await fetchEditRole(roleId, roleName, roleDescription);
    setRoleId("");
    setRoleName("");
    setRoleDescription("");
    setOpenModal(false);
  };

  const handleShowDialogEditRole = (
    roleId: string,
    roleName: string,
    roleDescription: string,
  ) => {
    setRoleId(roleId);
    setRoleName(roleName);
    setRoleDescription(roleDescription);
    setEditRole(true);
    setOpenModal(true);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPage(0);
    setSearchQuery(event.target.value);
  };

  const handleButtonClick = (selectedContext: "left" | "right") => {
    if (selectedContext === "left") {
      navigate("?type=Users");
    } else if (selectedContext === "right") {
      navigate("?type=Roles");
    }
    setContext(selectedContext);
  };

  const handleRoleChange = async (
    event: SelectChangeEvent<string>,
    userId: string,
  ) => {
    const newRole = event.target.value;
    setSelectedRoles((prevSelectedRoles) => ({
      ...prevSelectedRoles,
      [userId]: newRole,
    }));
    await fetchAddUserRole(userId, newRole);
  };

  const getSelectedRole = (userId: string) => {
    return selectedRoles[userId] || "";
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) {
      return <Typography>{text}</Typography>;
    }

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return (
      <Typography>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "#c8e6c9" }}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
      </Typography>
    );
  };

  const handleConfirmDelete = async () => {
    if (userProfile?.email === confirmationEmail) {
      if (userToDelete) {
        await fetchDeleteUser(userToDelete);
        setUserToDelete(null);
      } else if (roleToDelete) {
        await fetchDeleteRole(roleToDelete);
        setRoleToDelete(null);
      }
      setOpenConfirmDialog(false);
      setConfirmationEmail("");
    }
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setUserToDelete(null);
    setRoleToDelete(null);
  };

  return (
    <Grid container height="100vh" width="100vw">
      <Grid item xs={12}>
        <Grid item xs={12}>
          <Container sx={logoContainerStyle}></Container>
        </Grid>
        <Grid item xs={12} container justifyContent="flex-end">
          <PopupState
            variant="popover"
            popupId="demo-popup-menu"
            disableAutoFocus={true}
          >
            {(popupState) => (
              <React.Fragment>
                <Button sx={menuButtonStyle} {...bindTrigger(popupState)}>
                  <MenuIcon style={{ fontSize: "35px" }} />
                </Button>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem onClick={handleUser}>User</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </Grid>
        <Divider sx={lineUpStyle} />
        <Grid container spacing={2} sx={userProfileContainer}>
          <Grid item xs={12} md={2} sx={boxSection}>
            <Paper sx={paperSection} elevation={10}>
              <Box sx={{ display: "flex", flexDirection: "column", pt: 2 }}>
                <Box sx={{ marginBottom: "10px", marginLeft: "10px" }}>
                  <AvatarDropdown />
                </Box>
                <Divider sx={lineUpStyle} />
                {context === "left" ? (
                  <Button
                    onClick={() => handleButtonClick("left")}
                    variant="text"
                    sx={buttonEnableStyle}
                  >
                    Manage Users
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleButtonClick("left")}
                    variant="text"
                    sx={buttonDisableStyle}
                  >
                    Manage Users
                  </Button>
                )}
                {context === "right" ? (
                  <Button
                    onClick={() => handleButtonClick("right")}
                    variant="text"
                    sx={buttonEnableStyle}
                  >
                    Manage Roles
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleButtonClick("right")}
                    variant="text"
                    sx={buttonDisableStyle}
                  >
                    Manage Roles
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          {context === "left" ? (
            /// Users page
            <Grid item xs={12} md={9} sx={{ ...boxSection, maxHeight: "91vh" }}>
              <Paper elevation={10} sx={paperSection}>
                <Box>
                  <Container maxWidth={false}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search..."
                      onChange={handleSearchChange}
                      sx={{ pt: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Container>
                  {isUsersLoading && (
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
                        loading={isUsersLoading}
                        cssOverride={override}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </Box>
                  )}
                  {!isUsersLoading && (
                    <Container maxWidth={false}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell>UserId</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>User Name</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Block</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {data?.users.map(
                              (user: {
                                userId: string;
                                email: string;
                                userName: string;
                                isBlocked: boolean;
                                roleName: string;
                              }) => {
                                const isItemSelected = selectedRows.includes(
                                  user.userId,
                                );
                                return (
                                  <TableRow
                                    key={user.userId}
                                    sx={
                                      isItemSelected
                                        ? {
                                            backgroundColor: (theme) =>
                                              theme.palette.action.hover,
                                          }
                                        : {}
                                    }
                                  >
                                    <TableCell>
                                      <Checkbox
                                        checked={isItemSelected}
                                        onChange={() =>
                                          handleCheckboxChange(user.userId)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>{user.userId}</TableCell>
                                    <TableCell>
                                      {highlightSearchText(
                                        user.email,
                                        searchQuery,
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {highlightSearchText(
                                        user.userName,
                                        searchQuery,
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        variant="standard"
                                        value={
                                          getSelectedRole(user.userId) === ""
                                            ? user.roleName === null
                                              ? ""
                                              : user.roleName
                                            : getSelectedRole(user.userId)
                                        }
                                        onChange={(e) =>
                                          handleRoleChange(e, user.userId)
                                        }
                                      >
                                        {dataRoles &&
                                          dataRoles.roles.map(
                                            (role: {
                                              roleId: string;
                                              name: string;
                                              description: string;
                                            }) => (
                                              <MenuItem
                                                key={role.roleId}
                                                value={role.name}
                                              >
                                                {role.name}
                                              </MenuItem>
                                            ),
                                          )}
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      {!user.isBlocked && (
                                        <IconButton
                                          disabled={isItemSelected}
                                          sx={blockButtonStyle}
                                          onClick={() =>
                                            handleBlockUser(user.userId)
                                          }
                                          aria-label="block"
                                        >
                                          <BlockIcon />
                                        </IconButton>
                                      )}
                                      {user.isBlocked && (
                                        <IconButton
                                          disabled={isItemSelected}
                                          sx={blockRedButtonStyle}
                                          onClick={() =>
                                            handleUnblockUser(user.userId)
                                          }
                                          aria-label="block"
                                        >
                                          <BlockIcon />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        disabled={isItemSelected}
                                        sx={blockButtonStyle}
                                        onClick={() =>
                                          handleRemoveUser(user.userId)
                                        }
                                        aria-label="delete"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                );
                              },
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box sx={paginationContainerStyle}>
                        {selectedRows.length === 0 && (
                          <Button
                            sx={deleteAllButtonDisableStyle}
                            onClick={handleDeleteSelectedRows}
                            disabled
                          >
                            Delete Selected
                          </Button>
                        )}
                        {selectedRows.length !== 0 && (
                          <Button
                            variant="contained"
                            sx={deleteAllButtonEnableStyle}
                            onClick={handleDeleteSelectedRows}
                          >
                            Delete Selected
                          </Button>
                        )}
                        {data?.noUsers !== undefined && (
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={data?.noUsers}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        )}
                      </Box>
                    </Container>
                  )}
                </Box>
              </Paper>
            </Grid>
          ) : (
            /// Roles page
            <Grid item xs={12} md={9} sx={{ ...boxSection, maxHeight: "91vh" }}>
              <Paper elevation={10} sx={paperSection}>
                {isRolesLoading && (
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
                      loading={isRolesLoading}
                      cssOverride={override}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </Box>
                )}
                {!isRolesLoading && (
                  <Box>
                    <Container maxWidth={false}>
                      <TableContainer>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Button
                            variant="contained"
                            sx={addNewRoleButtonStyle}
                            onClick={handleAddNewRole}
                          >
                            Add new role
                          </Button>
                          <Dialog open={openModal} onClose={handleCloseModal}>
                            {!editRole ? (
                              <DialogTitle>Add New Role</DialogTitle>
                            ) : (
                              <DialogTitle>Edit Role</DialogTitle>
                            )}
                            <DialogContent>
                              {!editRole ? (
                                <DialogContentText>
                                  Please enter the details for the new role:
                                </DialogContentText>
                              ) : (
                                <DialogContentText>
                                  Please enter the new details for the role:
                                </DialogContentText>
                              )}
                              <TextField
                                autoFocus
                                margin="dense"
                                label="Role Name"
                                type="text"
                                fullWidth
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                              />
                              <TextField
                                margin="dense"
                                label="Role Description"
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                value={roleDescription}
                                onChange={(e) =>
                                  setRoleDescription(e.target.value)
                                }
                              />
                              {!editRole ? (
                                <DialogContentText>
                                  If you want to add the new role click Save
                                  button.
                                </DialogContentText>
                              ) : (
                                <DialogContentText>
                                  If you want to edit the new role click Edit
                                  button.
                                </DialogContentText>
                              )}
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={handleCloseModal}
                                variant="contained"
                                sx={cancelButtonStyle}
                              >
                                Cancel
                              </Button>
                              {!editRole ? (
                                <Button
                                  onClick={handleSaveRole}
                                  variant="contained"
                                  sx={addNewRoleButtonStyle}
                                >
                                  Save
                                </Button>
                              ) : (
                                <Button
                                  onClick={handleEditRole}
                                  variant="contained"
                                  sx={addNewRoleButtonStyle}
                                >
                                  Edit
                                </Button>
                              )}
                            </DialogActions>
                          </Dialog>
                        </Box>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>RoleId</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataRoles?.roles.map(
                              (role: {
                                roleId: string;
                                name: string;
                                description: string;
                              }) => {
                                const isItemSelected = selectedRows.includes(
                                  role.roleId,
                                );
                                return (
                                  <TableRow
                                    key={role.roleId}
                                    sx={
                                      isItemSelected
                                        ? { backgroundColor: "#f2f2f2" }
                                        : {}
                                    }
                                  >
                                    <TableCell>{role.roleId}</TableCell>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell>{role.description}</TableCell>

                                    <TableCell>
                                      <IconButton
                                        disabled={isItemSelected}
                                        sx={blockButtonStyle}
                                        onClick={() =>
                                          handleShowDialogEditRole(
                                            role.roleId,
                                            role.name,
                                            role.description,
                                          )
                                        }
                                        aria-label="edit"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      {role.name !== "admin" &&
                                        role.name !== "user" && (
                                          <IconButton
                                            disabled={isItemSelected}
                                            sx={blockButtonStyle}
                                            onClick={() =>
                                              handleRemoveRole(role.name)
                                            }
                                            aria-label="delete"
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        )}
                                    </TableCell>
                                  </TableRow>
                                );
                              },
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Container>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your email to confirm the deletion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={confirmationEmail}
            onChange={(e) => setConfirmationEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            disabled={!confirmationEmail}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const buttonEnableStyle = {
  textTransform: "unset",
  fontSize: "20px",
  backgroundColor: "#ccc",
  color: "black",
  cursor: "pointer",
};

const buttonDisableStyle = {
  textTransform: "unset",
  fontSize: "20px",
  backgroundColor: "transparent",
  color: "#888",
  cursor: "pointer",
};

const userProfileContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  height: "93%",
};

const menuButtonStyle = {
  backgroundColor: "transparent",
  color: "#888",
  cursor: "pointer",
  marginLeft: "96%",
  marginTop: "-1.5%",
  fontSize: "1.5rem",
  padding: "10px",
};

const boxSection = {
  flex: 1,
  height: "100%",
};

const paperSection = {
  paddingLeft: "16px",
  paddingRight: "16px",
  height: "100%",
  overflow: "auto",
};

const blockButtonStyle = {
  backgroundColor: "transparent",
  color: "#aa",
  cursor: "pointer",
  alignContent: "center",
};

const blockRedButtonStyle = {
  backgroundColor: "transparent",
  color: "#FF6666",
  cursor: "pointer",
  alignContent: "center",
  "&:hover": {
    backgroundColor: "transparent",
    color: "red",
  },
};

const lineUpStyle = {
  marginBottom: "15px",
  border: "none",
  borderTop: "1px solid #ccc",
  width: "100%",
};

const logoContainerStyle = {
  marginBottom: "-35px",
  textAlign: "center",
  alignContent: "center",
  height: "60px",
  backgroundColor: "transparent",
};

const paginationContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
};

const deleteAllButtonEnableStyle = {
  textTransform: "unset",
  padding: "10px",
  marginBottom: "10px",
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
  textTransform: "unset",
  padding: "10px",
  marginBottom: "10px",
  marginTop: "15px",
  backgroundColor: "#ccc",
  color: "#000",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#bbb",
  },
};

const addNewRoleButtonStyle = {
  textTransform: "unset",
  padding: "10px",
  marginBottom: "10px",
  marginTop: "15px",
  backgroundColor: "#2E8B57",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#25764F",
  },
};

const deleteAllButtonDisableStyle = {
  textTransform: "unset",
  padding: "10px",
  marginBottom: "10px",
  backgroundColor: "#bbb",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default DashboardAdmin;
