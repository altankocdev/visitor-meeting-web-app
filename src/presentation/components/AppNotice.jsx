import { Alert, Snackbar } from "@mui/material";

export function AppNotice({ notice, onClose }) {
  const normalized = typeof notice === "string"
    ? { severity: "error", text: notice }
    : notice;

  return (
    <Snackbar
      open={Boolean(normalized?.text)}
      autoHideDuration={5500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 2 }}
    >
      <Alert
        severity={normalized?.severity ?? "info"}
        variant="filled"
        onClose={onClose}
        sx={{ minWidth: 320, maxWidth: 520, boxShadow: 4 }}
      >
        {normalized?.text}
      </Alert>
    </Snackbar>
  );
}
