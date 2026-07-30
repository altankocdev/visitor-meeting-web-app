import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App } from "./presentation/App";
import { theme } from "./presentation/theme";
import "./presentation/styles/global.css";
import { AuthProvider } from "./presentation/auth/AuthContext";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></ThemeProvider></React.StrictMode>,
);
