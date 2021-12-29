import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";
import { useEffect } from "react";

function App() {
    useEffect(() => {
        const socket = io("http://localhost:3001", {
            reconnectionDelayMax: 10000,
            auth: {
                token: "123",
            },
            query: {
                "my-key": "my-value",
            },
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
