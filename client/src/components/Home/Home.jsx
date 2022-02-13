import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    CssBaseline,
    Fab,
    TextField,
    Button,
    Slider,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";

export let socket;
const ENDPOINT = process.env.REACT_APP_API || "http://localhost:3001";

function Home({ setIsDarkApp, isDark }) {
    useEffect(() => {
        getQuestions();
    }, []);

    const navigate = useNavigate();

    const [roomNoExist, setRoomNoExist] = useState(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [play, setPlay] = useState(false);
    const [playForm, setPlayForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        name: "",
        room: "",
        maxQuestions: false,
    });

    const changeTheme = () => {
        setIsDarkApp(!isDark);
        localStorage.setItem("theme", isDark ? "light" : "dark");
    };

    const codeGenerator = (length) => {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const getQuestions = async () => {
        const res = await axios.get("/questions");
        setNumberOfQuestions(res.data.length);
    };

    const playFormCreate = () => {
        setPlayForm("create");
        setInput({
            ...input,
            maxQuestions: numberOfQuestions,
        });
    };

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
            let roomCode;
            if (playForm === "create") roomCode = codeGenerator(5);
            else roomCode = input.room;

            socket = io(ENDPOINT, {
                // reconnectionDelayMax: 10000,
                // auth: {
                //     token: "123",
                // },
                // query: {
                //     "my-key": "my-value",
                // },
            });

            socket.on("connect", () => {
                if (playForm === "join") {
                    socket.emit("roomExist", roomCode, (noExist) => {
                        if (noExist) {
                            setLoading(false);
                            setInput({
                                ...input,
                                room: "",
                            });
                            socket.disconnect();
                            setRoomNoExist(true);
                        } else {
                            setLoading(false);
                            socket.emit("newUser", {
                                name: input.name,
                                socketId: socket.id,
                                room: roomCode,
                            });
                            navigate(`/game/${roomCode}`);
                        }
                    });
                } else {
                    socket.emit("newUser", {
                        name: input.name,
                        socketId: socket.id,
                        room: roomCode,
                        maxQuestions: input.maxQuestions,
                    });
                    navigate(`/game/${roomCode}`);
                }
            });
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
                {play ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {playForm === "create" ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Fab
                                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                                    onClick={() => setPlayForm(false)}
                                    color="primary"
                                    aria-label="Volver atrás"
                                >
                                    <ArrowBackIosNewIcon />
                                </Fab>

                                <Box sx={{ width: "18em", marginBottom: "1em" }}>
                                    <Typography id="slider-label" gutterBottom>
                                        {`Preguntas: ${input.maxQuestions}`}
                                    </Typography>

                                    <Slider
                                        name="maxQuestions"
                                        defaultValue={numberOfQuestions}
                                        min={10}
                                        max={numberOfQuestions}
                                        aria-labelledby="slider-label"
                                        valueLabelDisplay="auto"
                                        onChange={handleChange}
                                    />
                                </Box>

                                <TextField
                                    error={input.name.length > 0 ? false : true}
                                    name="name"
                                    autoComplete="name"
                                    value={input.name}
                                    label="Nombre"
                                    helperText={
                                        input.name.length > 0
                                            ? "Será visible para los demás jugadores"
                                            : "Completa el campo para comenzar el juego"
                                    }
                                    onChange={handleChange}
                                    sx={{ width: "18em" }}
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
                            </Box>
                        ) : playForm === "join" ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Fab
                                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                                    onClick={() => setPlayForm(false)}
                                    color="primary"
                                    aria-label="Volver atrás"
                                >
                                    <ArrowBackIosNewIcon />
                                </Fab>

                                <TextField
                                    error={input.name.length > 0 ? false : true}
                                    name="name"
                                    autoComplete="name"
                                    value={input.name}
                                    label="Nombre"
                                    helperText={
                                        input.name.length > 0
                                            ? "Será visible para los demás jugadores"
                                            : "Completa el campo para comenzar el juego"
                                    }
                                    onChange={handleChange}
                                    sx={{ width: "18em", marginBottom: "1em" }}
                                />

                                <TextField
                                    error={input.room.length > 0 ? false : true}
                                    name="room"
                                    autoComplete="off"
                                    value={input.room}
                                    label="Código de la sala"
                                    helperText={input.room.length > 0 ? "" : "Completa el campo para comenzar el juego"}
                                    onChange={handleChange}
                                    sx={{ width: "18em" }}
                                />
                                <LoadingButton
                                    variant="contained"
                                    onClick={handleSubmit}
                                    loading={loading}
                                    disabled={input.name.length > 0 && input.room.length > 0 ? false : true}
                                    sx={{
                                        marginTop: "1em",
                                    }}
                                >
                                    Jugar
                                </LoadingButton>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Fab
                                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                                    onClick={() => setPlay(false)}
                                    color="primary"
                                    aria-label="Volver atrás"
                                >
                                    <ArrowBackIosNewIcon />
                                </Fab>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => playFormCreate()}
                                    sx={{ fontSize: "1.2em", marginBottom: "1em" }}
                                >
                                    Crear Sala
                                </Button>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => setPlayForm("join")}
                                    sx={{ fontSize: "1.2em", marginBottom: "1em" }}
                                >
                                    Unirse
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Fab
                            sx={{ position: "absolute", top: "10vh" }}
                            onClick={() => changeTheme()}
                            color="primary"
                            aria-label="Cambiar tema"
                        >
                            {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                        </Fab>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => setPlay(true)}
                            sx={{ fontSize: "1.2em", marginBottom: "1em" }}
                        >
                            Jugar
                        </Button>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/new-question")}
                            sx={{ fontSize: "1.2em", marginBottom: "1em" }}
                        >
                            Añadir Preguntas
                        </Button>
                    </Box>
                )}

                <Dialog
                    open={roomNoExist}
                    onClose={() => setRoomNoExist(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">La sala no existe</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Prueba ingresando el código de la sala nuevamente respetando las mayúsculas y minúsculas o
                            crea una sala nueva
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRoomNoExist(false)} autoFocus>
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </React.Fragment>
    );
}

export default Home;
