import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Container, CssBaseline, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

export let socket;
const ENDPOINT = process.env.REACT_APP_API || "http://localhost:3001";

function Landing() {
    useEffect(() => {
        socket = io(ENDPOINT, {
            // reconnectionDelayMax: 10000,
            // auth: {
            //     token: "123",
            // },
            // query: {
            //     "my-key": "my-value",
            // },
        });

        // socket.on("connect", () => {
        //     console.log(socket.id);
        // });
    }, []);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        name: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({
            ...input,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        setLoading(true);
        const timer = setTimeout(() => {
            socket.emit("newUser", {
                name: input.name,
                socketId: socket.id,
            });
            navigate("/game");
        }, 2000);
        return () => clearTimeout(timer);
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Container
                maxWidth="md"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
            >
                <TextField
                    error={input.name.length > 0 ? false : true}
                    name="name"
                    autoComplete="true"
                    label="Nombre"
                    helperText={input.name.length > 0 ? "Será visible para los demás jugadores" : "Completa el campo"}
                    onChange={handleChange}
                />
                <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={input.name.length > 0 ? false : true}
                    sx={{
                        marginTop: "1em",
                    }}
                >
                    Jugar
                </LoadingButton>
            </Container>
        </React.Fragment>
    );
}

export default Landing;
