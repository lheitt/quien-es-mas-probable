import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../Landing/Landing";
import { usernames } from "../Game/Game";
import { Alert, Container, CssBaseline, Fab, TextField } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";

function NewQuestion() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [renderAlert, setRenderAlert] = useState(false);
    const [input, setInput] = useState({
        question: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({
            ...input,
            [name]: value,
        });
        setRenderAlert(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const username = usernames.filter((user) => user.socketId === socket.id)[0].name;

        await axios.post("/new-question", {
            question: input.question,
            username: username,
        });

        setLoading(false);
        setRenderAlert(true);
        setInput({ question: "" });
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
                    sx={{ position: "absolute", left: "10vw", top: "10vh" }}
                    onClick={() => navigate("/game")}
                    color="primary"
                    aria-label="Volver al juego"
                >
                    <ArrowBackIosNewIcon />
                </Fab>

                {renderAlert ? (
                    <Alert severity="success" sx={{ marginBottom: "1em" }}>
                        ¡Pregunta añadida correctamente!
                    </Alert>
                ) : (
                    <></>
                )}

                <TextField
                    error={input.question.length < 25 ? true : false}
                    name="question"
                    label="Pregunta"
                    value={input.question}
                    helperText={
                        input.question.length === 0
                            ? "Completa el campo"
                            : input.question.length >= 25
                            ? "Nada de preguntas sexuales eh 😝"
                            : "La pregunta debe contener mas de 25 caracteres"
                    }
                    onChange={handleChange}
                    sx={{ width: "20em" }}
                />
                <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={input.question.length > 0 ? false : true}
                    sx={{
                        marginTop: "1em",
                    }}
                >
                    Añadir pregunta
                </LoadingButton>
            </Container>
        </React.Fragment>
    );
}

export default NewQuestion;
