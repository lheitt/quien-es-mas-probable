import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../Landing/Landing";
import { Typography, Button, Container, CssBaseline, Fab, Box, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import axios from "axios";

// let socket;
export let usernames;

function Game() {
    useEffect(() => {
        socket.emit("reload", true);

        socket.on("renderedQuestionClient", (renderedQuestion) => {
            setRenderedQuestion(renderedQuestion);
            setUserSelected(undefined);
        });

        socket.on("newUser", (users) => {
            setUsers(users);
            usernames = users;
            console.log(users);
        });

        socket.on("reload", (users) => {
            setUsers(users);
            usernames = users;
            getQuestions();
        });

        socket.on("addingNewQuestion", (user) => {
            setAddingNewQuestion({
                username: user,
            });
            setUserSelected(undefined);
        });

        getQuestions();
    }, []);

    const getQuestions = async () => {
        const res = await axios.get("/questions");
        setQuestions(res.data);
    };

    const navigate = useNavigate();
    const matches = useMediaQuery("(min-width:500px)");

    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [renderedQuestion, setRenderedQuestion] = useState("");
    const [userSelected, setUserSelected] = useState(undefined);
    const [addingNewQuestion, setAddingNewQuestion] = useState(undefined);

    const userButtonPressed = (key) => {
        if (userSelected === key) return setUserSelected(undefined);
        setUserSelected(key);
    };

    const homeButtonPressed = () => {
        socket.disconnect();
        navigate("/");
    };

    const addNewQuestionButtonPressed = () => {
        socket.emit("addingNewQuestion", socket.id);
        navigate("/new-question");
    };

    const handleSubmit = (e) => {
        // setRenderedQuestion(Math.round(Math.random() * (questions.length - 1)));
        if (renderedQuestion === "" || renderedQuestion === questions.length - 1) {
            // setRenderedQuestion(0);
            socket.emit("renderedQuestionServer", 0);
            return;
        }
        // setRenderedQuestion(renderedQuestion + 1);
        socket.emit("renderedQuestionServer", renderedQuestion + 1);
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
                <Fab
                    sx={{ position: "absolute", left: matches ? "85vw" : "75vw", top: "10vh" }}
                    onClick={() => addNewQuestionButtonPressed()}
                    color="primary"
                    aria-label="Añadir nueva pregunta"
                >
                    <AddIcon />
                </Fab>

                <Fab
                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                    onClick={() => homeButtonPressed()}
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

                                {addingNewQuestion && addingNewQuestion.username === user.name ? (
                                    <Typography variant="overline">Añadiendo una nueva pregunta ⌛</Typography>
                                ) : (
                                    <></>
                                )}
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
                        {renderedQuestion !== "" ? (
                            <Typography variant="h4" component="h4" gutterBottom sx={{ textAlign: "center" }}>
                                {questions[renderedQuestion]}
                            </Typography>
                        ) : (
                            <></>
                        )}

                        <Button variant="contained" onClick={handleSubmit}>
                            {renderedQuestion === "" ? "PRIMERA PREGUNTA" : "SIGUIENTE PREGUNTA"}
                        </Button>

                        {renderedQuestion !== "" ? (
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
            </Container>
        </React.Fragment>
    );
}

export default Game;
