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
import axios from "axios";

function Game() {
    useEffect(() => {
        socket.emit("reload", { bolean: true, socketId: socket.id });

        socket.on("renderedQuestionClient", (renderedQuestion) => {
            setRenderedQuestion(renderedQuestion);
            setUserSelected(undefined);
        });

        socket.on("newUser", (props) => {
            setUsers(props.users);
            setUserSelected(undefined);
            getQuestions(props.room);
        });

        socket.on("reload", (props) => {
            setUsers(props.users);
            setUserSelected(undefined);
        });

        actualTheme === "dark" ? setIsDark(true) : setIsDark(false);
    }, []);

    const getQuestions = async (roomUser) => {
        const res = await axios.post("/questions-server", { serverCode: roomUser });
        setQuestions(res.data);
    };

    const navigate = useNavigate();
    const actualTheme = localStorage.getItem("theme");
    const { room } = useParams();

    const matches = useMediaQuery("(min-width:500px)");

    const [open, setOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [renderedQuestion, setRenderedQuestion] = useState(null);
    const [userSelected, setUserSelected] = useState(undefined);

    const theme = createTheme({
        palette: {
            mode: isDark ? "dark" : "light",
        },
    });

    const userButtonPressed = (key) => {
        if (userSelected === key) return setUserSelected(undefined);
        setUserSelected(key);
    };

    const homeButtonPressed = () => {
        socket.disconnect();
        navigate("/");
    };

    const copyCode = async () => {
        await navigator.clipboard.writeText(room);
    };

    const handleSubmit = (e) => {
        // setRenderedQuestion(Math.round(Math.random() * (questions.length - 1)));
        if (renderedQuestion === null || renderedQuestion === questions.length - 1) {
            // setRenderedQuestion(0);
            socket.emit("renderedQuestionServer", { renderedQuestion: 0, socketId: socket.id });
            return;
        }
        // setRenderedQuestion(renderedQuestion + 1);
        socket.emit("renderedQuestionServer", { renderedQuestion: renderedQuestion + 1, socketId: socket.id });
    };

    return (
        <ThemeProvider theme={theme}>
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
                    <Tooltip
                        sx={{ position: "absolute", left: matches ? "80vw" : "55vw", top: "10vh" }}
                        disableFocusListener
                        title={`${room}`}
                    >
                        <Button onClick={copyCode}>Código de sala</Button>
                    </Tooltip>

                    <Fab
                        sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                        onClick={() => setOpen(true)}
                        color="primary"
                        aria-label="Volver al inicio"
                    >
                        <HomeRoundedIcon />
                    </Fab>

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
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color={userSelected === key ? "success" : "error"}
                                        onClick={() => userButtonPressed(key)}
                                        sx={{ fontSize: "2em" }}
                                    >
                                        {user.name}
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <></>
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
                                    <Typography variant="h4" component="h4" gutterBottom sx={{ textAlign: "center" }}>
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

                            <Button variant="contained" onClick={handleSubmit}>
                                {renderedQuestion === null ? "PRIMERA PREGUNTA" : "SIGUIENTE PREGUNTA"}
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
                        <DialogTitle id="alert-dialog-title">{"¿Volver al menú?"}</DialogTitle>
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
        </ThemeProvider>
    );
}

export default Game;
