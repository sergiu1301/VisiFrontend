import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { Checkbox } from "@mui/material";

const UserBox = ({
  user,
  selected,
  searchQuery,
  onSelect,
}: {
  user: { userName: string; firstName: string; lastName: string };
  selected: true | false;
  searchQuery: string;
  onSelect: () => void;
}) => {
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

  return (
    <Box
      onClick={onSelect}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={3}
      sx={{
        width: "100%",
        height: "20px",
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: (theme) => theme.palette.action.hover,
          cursor: "pointer",
        },
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <Avatar
        alt={user.userName}
        src={user.userName}
        sx={{ width: 40, height: 40 }}
      />
      {highlightSearchText(user.userName, searchQuery)}
      <Checkbox checked={selected} onChange={onSelect} />
    </Box>
  );
};

export default UserBox;
