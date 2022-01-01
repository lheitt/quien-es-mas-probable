import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../Landing/Landing";
import db from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Typography, Button, Container, CssBaseline, Stack, Fab, Box, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// let socket;
export let usernames;

function Game() {
    useEffect(async () => {
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
        });

        const querySnapshot = await getDocs(collection(db, "questions"));
        querySnapshot.forEach((doc) => {
            // console.log(doc, "_DOC");
            // console.log(Object.keys(doc._document.data.value.mapValue.fields).sort());
            setQuestions(Object.keys(doc._document.data.value.mapValue.fields).sort());
        });
    }, []);

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [renderedQuestion, setRenderedQuestion] = useState("");
    const [userSelected, setUserSelected] = useState(undefined);

    const userButtonPressed = (key) => {
        if (userSelected === key) return setUserSelected(undefined);
        setUserSelected(key);
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
                    sx={{ position: "absolute", left: "85vw", top: "10vh" }}
                    onClick={() => navigate("/new-question")}
                    color="primary"
                    aria-label="Añadir nueva pregunta"
                >
                    <AddIcon />
                </Fab>

                {users.length !== 0 ? (
                    <Stack spacing={10} direction="row" sx={{ marginBottom: "4em" }}>
                        {users.map((user, key) => (
                            <Button
                                key={key}
                                variant="contained"
                                size="large"
                                color={userSelected === key ? "success" : "error"}
                                onClick={() => userButtonPressed(key)}
                                sx={{ fontSize: "2em" }}
                            >
                                {user.name}
                            </Button>
                        ))}
                    </Stack>
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
