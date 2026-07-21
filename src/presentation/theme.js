import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#0F4C75", light: "#3282B8", dark: "#1B262C" },
    info: { main: "#3282B8", light: "#BBE1FA" },
    background: { default: "#F3F7FA", paper: "#FFFFFF" },
    text: { primary: "#1B262C", secondary: "#70818B" },
  },
  typography: { fontFamily: '"DM Sans", sans-serif', h4: { fontFamily: '"Manrope", sans-serif', fontWeight: 700 } },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700, borderRadius: 11, boxShadow: "none" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});
