import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import db from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Typography, Button, Container, CssBaseline } from "@mui/material";

let socket;
let questions;

function Game() {
    useEffect(async () => {
        socket = io("http://192.168.0.28:3001", {
            reconnectionDelayMax: 10000,
            auth: {
                token: "123",
            },
            query: {
                "my-key": "my-value",
            },
        });

        socket.on("connect", () => {
            console.log(socket.id);
        });

        socket.on("renderedQuestionClient", (arg) => {
            setRenderedQuestion(arg);
        });

        const querySnapshot = await getDocs(collection(db, "questions"));
        querySnapshot.forEach((doc) => {
            // console.log(doc, "_DOC");
            console.log(Object.keys(doc._document.data.value.mapValue.fields).sort());
            questions = Object.keys(doc._document.data.value.mapValue.fields).sort();
        });
    }, []);

    const [renderedQuestion, setRenderedQuestion] = useState("");

    const handleSubmit = (e) => {
        // setRenderedQuestion(Math.round(Math.random() * (questions.length - 1)));
        if (
            renderedQuestion === "" ||
            renderedQuestion === questions.length - 1
        ) {
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
                {renderedQuestion !== "" ? (
                    <Typography
                        variant="h4"
                        component="h4"
                        gutterBottom
                        sx={{ textAlign: "center" }}
                    >
                        {questions[renderedQuestion]}
                    </Typography>
                ) : (
                    <></>
                )}

                <Button variant="contained" onClick={handleSubmit}>
                    {renderedQuestion === ""
                        ? "PRIMERA PREGUNTA"
                        : "SIGUIENTE PREGUNTA"}
                </Button>
            </Container>
        </React.Fragment>
    );
}

export default Game;
