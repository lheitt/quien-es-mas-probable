
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing/Landing";
import Game from "./components/Game/Game";

function App() {
    return (
        <React.Fragment>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </React.Fragment>
    );
}

export default App;
