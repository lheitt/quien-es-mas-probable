import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Button, TextInput, HelperText, Title, Appbar, Provider as PaperProvider } from "react-native-paper";
import { lightTheme, darkTheme } from "../Home/Home";
import { ENDPOINT } from "../Home/Home";
import axios from "axios";

export default function NewQuestion({ navigation }) {
    useEffect(() => {
        getTheme();
    }, []);

    const [isDark, setIsDark] = useState(false);
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

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    const handleChange = (text, type) => {
        setInput({
            ...input,
            [type]: text,
        });
        setRenderAlert(false);
    };

    const handleSubmit = async (e) => {
        setLoading(true);

        await axios.post(`${ENDPOINT}/new-question`, {
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#fff",
            justifyContent: "center",
            alignItems: "center",
            padding: 15,
        },

        input: {
            marginBottom: 5,
            marginTop: 10,
            width: "95%",
        },
    });

    return (
        <PaperProvider theme={isDark ? darkTheme : lightTheme}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.navigate("Home")} />
                <Appbar.Content title="Nueva pregunta" />
            </Appbar.Header>
            <View style={styles.container}>
                {renderAlert ? (
                    <Title style={{ backgroundColor: isDark ? "rgb(12, 19, 13)" : "rgb(237, 247, 237)", padding: 5 }}>
                        ✅ ¡Pregunta añadida correctamente!
                    </Title>
                ) : (
                    <></>
                )}

                <TextInput
                    label="Nombre"
                    mode="outlined"
                    error={input.name.length > 0 ? false : true}
                    value={input.name}
                    onChangeText={(name) => handleChange(name, "name")}
                    style={styles.input}
                />
                <HelperText type={input.name.length > 0 ? "info" : "error"}>
                    {input.name.length > 0
                        ? "Será visible debajo de la pregunta junto con el apellido"
                        : "Completa el campo"}
                </HelperText>

                <TextInput
                    label="Apellido"
                    mode="outlined"
                    error={input.lastname.length > 0 ? false : true}
                    value={input.lastname}
                    onChangeText={(lastname) => handleChange(lastname, "lastname")}
                    style={styles.input}
                />
                <HelperText type={input.lastname.length > 0 ? "info" : "error"}>
                    {input.lastname.length > 0
                        ? "Será visible debajo de la pregunta junto con el nombre"
                        : "Completa el campo"}
                </HelperText>

                <TextInput
                    label="Pregunta"
                    mode="outlined"
                    error={input.question.length < 25 ? true : false}
                    value={input.question}
                    onChangeText={(question) => handleChange(question, "question")}
                    style={styles.input}
                />
                <HelperText type={input.question.length >= 25 ? "info" : "error"}>
                    {input.question.length === 0
                        ? "Completa el campo"
                        : input.question.length >= 25
                        ? "Nada de preguntas sexuales 😝"
                        : "La pregunta debe contener mas de 25 caracteres"}
                </HelperText>

                <Button
                    mode="contained"
                    loading={loading}
                    disabled={
                        loading
                            ? true
                            : input.question.length >= 25 && input.name.length > 0 && input.lastname.length > 0
                            ? false
                            : true
                    }
                    onPress={() => handleSubmit()}
                    style={{ marginTop: 15 }}
                >
                    Añadir pregunta
                </Button>

                <StatusBar style="light" />
            </View>
        </PaperProvider>
    );
}
