import React, { useEffect, useState } from "react";
import { socket } from "../Home/Home";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import {
    createTheme,
    useMediaQuery,
    Typography,
    Button,
    Container,
    CssBaseline,
    Fab,
    Box,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Dialog,
    Tooltip,
} from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

function Game({ isDark }) {
    useEffect(() => {
        socket.emit("reload", { bolean: true, socketId: socket.id });

        socket.on("username", (props) => {
            if (props.socketId === socket.id) setUsername(props.username);
        });

        socket.on("renderedQuestionClient", (renderedQuestion) => {
            setRenderedQuestion(renderedQuestion);
            setSelectedUser(undefined);
            setShowResults(false);
        });

        socket.on("newUser", (props) => {
            setUsers(props.users);
            setSelectedUser(undefined);
            getQuestions(props.room);
            socket.emit("username", { socketId: socket.id, room: room });
        });

        socket.on("reload", (props) => {
            setUsers(props.users);
            setSelectedUser(undefined);
            setNextQuestionEnabled(false);
        });

        socket.on("nextQuestionEnabled", (bolean) => {
            if (bolean) setNextQuestionEnabled(true);
            else setNextQuestionEnabled(false);
        });

        socket.on("showResults", (recivedResults) => {
            setResults(recivedResults);
            setShowResults(true);
        });

        socket.on("noVoteUsers", (recivedUsers) => {
            setUsers(recivedUsers);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getQuestions = async (roomUser) => {
        const res = await axios.post("/questions-server", { serverCode: roomUser });
        setQuestions(res.data);
    };

    const navigate = useNavigate();
    const { room } = useParams();

    const matches = useMediaQuery("(min-width:500px)");

    const [tooltipRoom, setTooltipRoom] = useState("Copiar");
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [renderedQuestion, setRenderedQuestion] = useState(null);
    const [selectedUser, setSelectedUser] = useState(undefined);
    const [username, setUsername] = useState("");
    const [nextQuestionEnabled, setNextQuestionEnabled] = useState(true);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const buttonTextTransformTheme = createTheme({
        palette: {
            mode: isDark ? "dark" : "light",
        },
        typography: {
            button: {
                textTransform: "none",
            },
        },
    });

    const userButtonPressed = (key) => {
        if (selectedUser === key) {
            setSelectedUser(undefined);
            socket.emit("selectedUser", { room: room, username: username, selectedUser: undefined });
            return;
        }
        setSelectedUser(key);
        socket.emit("selectedUser", { room: room, username: username, selectedUser: users[key].name });
    };

    const homeButtonPressed = () => {
        socket.disconnect();
        navigate("/");
    };

    const copyCode = async () => {
        await navigator.clipboard.writeText(room);
        setTooltipRoom("Copiado!");
    };

    const handleSubmit = (e) => {
        // setRenderedQuestion(Math.round(Math.random() * (questions.length - 1)));
        if (renderedQuestion === null || renderedQuestion === questions.length - 1) {
            socket.emit("renderedQuestionServer", { renderedQuestion: 0, room: room });
            return;
        }
        socket.emit("renderedQuestionServer", { renderedQuestion: renderedQuestion + 1, room: room });
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Container
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
                <ThemeProvider theme={buttonTextTransformTheme}>
                    <Tooltip
                        sx={{ position: "absolute", left: matches ? "80vw" : "55vw", top: "10vh" }}
                        disableFocusListener
                        title={`${tooltipRoom}`}
                        onClose={() => setTooltipRoom("Copiar")}
                    >
                        <Button onClick={copyCode} endIcon={<ContentCopyIcon />}>
                            SALA: {room}
                        </Button>
                    </Tooltip>
                </ThemeProvider>

                <Fab
                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                    onClick={() => setOpen(true)}
                    color="primary"
                    aria-label="Volver al inicio"
                >
                    <HomeRoundedIcon />
                </Fab>

                {showResults ? (
                    <Box sx={{ marginBottom: "1em" }}>
                        {results.map((user, key) => (
                            <Typography key={key} variant="h5" component="h5" gutterBottom sx={{ textAlign: "center" }}>
                                {user.username === username && user.selectedUser === username
                                    ? `Te votaste a ti mismo`
                                    : user.username === username
                                    ? `Votaste a ${user.selectedUser}`
                                    : user.selectedUser === username
                                    ? `${user.username} te votó`
                                    : user.username === user.selectedUser
                                    ? `${user.username} se votó a sí mismo`
                                    : `${user.username} votó a ${user.selectedUser}`}
                            </Typography>
                        ))}
                    </Box>
                ) : (
                    <Box>
                        {users.length !== 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: "2em",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "4em",
                                }}
                            >
                                {users.map((user, key) => (
                                    <Box
                                        key={key}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flexWrap: "wrap",
                                            gap: ".5em",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="large"
                                            color={selectedUser === key ? "success" : "error"}
                                            onClick={() => userButtonPressed(key)}
                                            sx={{ fontSize: "2em" }}
                                        >
                                            {user.name}
                                        </Button>

                                        {renderedQuestion === null ? (
                                            <></>
                                        ) : user.vote === true ? (
                                            <></>
                                        ) : (
                                            <Typography sx={{ position: "absolute", top: "6em" }} variant="overline">
                                                {user.name === username ? "No votaste" : "No votó"}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <></>
                        )}
                    </Box>
                )}

                {questions.length !== 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {renderedQuestion !== null ? (
                            <>
                                <Typography
                                    variant="h4"
                                    component="h4"
                                    gutterBottom={questions[renderedQuestion].addedBy !== "Default" ? false : true}
                                    sx={{ textAlign: "center" }}
                                >
                                    {questions[renderedQuestion].question}
                                </Typography>
                                {questions[renderedQuestion].addedBy !== "Default" ? (
                                    <Typography
                                        variant="h6"
                                        component="h6"
                                        gutterBottom
                                        sx={{ textAlign: "center", marginBottom: "1em" }}
                                    >{`(añadida por ${questions[renderedQuestion].addedBy})`}</Typography>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}

                        <Button
                            disabled={!nextQuestionEnabled && renderedQuestion !== null}
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            {renderedQuestion === null
                                ? "PRIMERA PREGUNTA"
                                : renderedQuestion === questions.length - 2
                                ? "ÚLTIMA PREGUNTA"
                                : renderedQuestion === questions.length - 1
                                ? "VOLVER A LA PRIMER PREGUNTA"
                                : "SIGUIENTE PREGUNTA"}
                        </Button>

                        {renderedQuestion !== null ? (
                            <Typography variant="subtitle1" gutterBottom>
                                {`${renderedQuestion + 1}/${questions.length}`}
                            </Typography>
                        ) : (
                            <></>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: "flex" }}>
                        <CircularProgress />
                    </Box>
                )}

                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">¿Volver al menú?</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Te saldrás de la sala actual
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={homeButtonPressed} autoFocus>
                            Salir
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </React.Fragment>
    );
}

export default Game;
