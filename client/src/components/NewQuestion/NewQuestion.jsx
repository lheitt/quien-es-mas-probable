import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        name: "",
        lastname: "",
    });

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

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

        await axios.post("/new-question", {
            question: input.question,
            name: capitalizeFirstLetter(input.name),
            lastname: capitalizeFirstLetter(input.lastname),
        });

        setLoading(false);
        setRenderAlert(true);
        setInput({
            ...input,
            question: "",
        });
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
                    onClick={() => navigate("/")}
                    color="primary"
                    aria-label="Volver atrás"
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
                    error={input.name.length > 0 ? false : true}
                    name="name"
                    autoComplete="name"
                    label="Nombre"
                    value={input.name}
                    helperText={
                        input.name.length > 0
                            ? "Será visible debajo de la pregunta junto con el apellido"
                            : "Completa el campo"
                    }
                    onChange={handleChange}
                    sx={{ width: "20em", marginBottom: "1em" }}
                />

                <TextField
                    error={input.lastname.length > 0 ? false : true}
                    name="lastname"
                    autoComplete="name-family"
                    label="Apellido"
                    value={input.lastname}
                    helperText={
                        input.lastname.length > 0
                            ? "Será visible debajo de la pregunta junto con el nombre"
                            : "Completa el campo"
                    }
                    onChange={handleChange}
                    sx={{ width: "20em", marginBottom: "1em" }}
                />

                <TextField
                    error={input.question.length < 25 ? true : false}
                    name="question"
                    autoComplete="off"
                    label="Pregunta"
                    value={input.question}
                    helperText={
                        input.question.length === 0
                            ? "Completa el campo"
                            : input.question.length >= 25
                            ? "Nada de preguntas sexuales 😝"
                            : "La pregunta debe contener mas de 25 caracteres"
                    }
                    onChange={handleChange}
                    sx={{ width: "20em" }}
                />
                <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={
                        input.question.length >= 25 && input.name.length > 0 && input.lastname.length > 0 ? false : true
                    }
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
