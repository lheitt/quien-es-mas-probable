import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import NewQuestion from "./components/NewQuestion/NewQuestion";
import { ThemeProvider } from "@emotion/react";
import { useState } from "react";
import { createTheme } from "@mui/material";
import { useEffect } from "react";

const actualTheme = localStorage.getItem("theme");
function App() {
    useEffect(() => {
        actualTheme === "dark" ? setIsDarkApp(true) : setIsDarkApp(false);
    }, []);

    const [isDarkApp, setIsDarkApp] = useState(false);
    const theme = createTheme({
        palette: {
            mode: isDarkApp ? "dark" : "light",
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <React.Fragment>
                <Routes>
                    <Route path="/" element={<Home setIsDarkApp={setIsDarkApp} isDark={isDarkApp} />} />
                    <Route path="/game/:room" element={<Game isDark={isDarkApp} />} />
                    <Route path="/new-question" element={<NewQuestion />} />
                </Routes>
            </React.Fragment>
        </ThemeProvider>
    );
}

export default App;
