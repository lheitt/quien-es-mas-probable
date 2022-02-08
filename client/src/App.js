import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import NewQuestion from "./components/NewQuestion/NewQuestion";

function App() {
    return (
        <React.Fragment>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:room" element={<Game />} />
                <Route path="/new-question" element={<NewQuestion />} />
            </Routes>
        </React.Fragment>
    );
}

export default App;
