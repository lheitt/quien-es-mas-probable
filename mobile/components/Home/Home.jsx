import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import {
    Button,
    FAB,
    DefaultTheme,
    DarkTheme,
    Appbar,
    TextInput,
    HelperText,
    Paragraph,
    Dialog,
    Portal,
    Title,
    Provider as PaperProvider,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import axios from "axios";

export const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#1976d2",
        accent: "#1976d2",
        error: "#d32f2f",
        sucess: "#2e7d32",
    },
};

export const darkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: "#90caf9",
        accent: "#90caf9",
        error: "#f44336",
        sucess: "#66bb6a",
    },
};

export let socket;

// export const ENDPOINT = "https://quien-es-mas-probable-lh.herokuapp.com";
export const ENDPOINT = "http://192.168.0.29:3001";

export default function Home({ navigation }) {
    useEffect(() => {
        getTheme();
        getQuestions();
    }, []);

    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [play, setPlay] = useState(false);
    const [playForm, setPlayForm] = useState(false);
    const [roomNoExist, setRoomNoExist] = useState(false);
    const [input, setInput] = useState({
        name: "",
        room: "",
        maxQuestions: false,
    });

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    const changeTheme = async () => {
        setIsDark(!isDark);
        await AsyncStorage.setItem("theme", isDark ? "light" : "dark");
    };

    const getQuestions = async () => {
        const res = await axios.get(`${ENDPOINT}/questions`);
        setNumberOfQuestions(res.data.length);
    };

    const playFormCreate = () => {
        setPlayForm("create");
        setInput({
            ...input,
            maxQuestions: numberOfQuestions,
        });
    };

    const codeGenerator = (length) => {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const handleChange = (text, type) => {
        setInput({
            ...input,
            [type]: text,
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
                            setPlayForm(false);
                            setPlay(false);
                            navigation.navigate("Game", {
                                room: roomCode,
                            });
                        }
                    });
                } else {
                    setLoading(false);
                    socket.emit("newUser", {
                        name: input.name,
                        socketId: socket.id,
                        room: roomCode,
                        maxQuestions: input.maxQuestions,
                    });
                    setPlayForm(false);
                    setPlay(false);
                    navigation.navigate("Game", {
                        room: roomCode,
                    });
                }
            });
        }, 2000);
        return () => clearTimeout(timer);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#fff",
            alignItems: "center",
            justifyContent: "center",
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
            {play ? (
                <>
                    {playForm === "create" ? (
                        <>
                            <Appbar.Header>
                                <Appbar.BackAction onPress={() => setPlayForm(false)} />
                                <Appbar.Content title="Crear sala" />
                            </Appbar.Header>
                            <View style={styles.container}>
                                <Title>{`Preguntas: ${input.maxQuestions}`}</Title>
                                <Slider
                                    style={{ width: "100%", marginBottom: 15 }}
                                    value={input.maxQuestions}
                                    step={1}
                                    minimumValue={10}
                                    maximumValue={numberOfQuestions}
                                    thumbTintColor={isDark ? "#90caf9" : "#1976d2"}
                                    minimumTrackTintColor={isDark ? "#90caf9" : "#1976d2"}
                                    maximumTrackTintColor={isDark ? "#90caf9" : "#1976d2"}
                                    onValueChange={(value) => handleChange(value, "maxQuestions")}
                                />

                                <TextInput
                                    label="Nombre"
                                    autoComplete="name"
                                    mode="outlined"
                                    error={input.name.length > 0 ? false : true}
                                    value={input.name}
                                    onChangeText={(name) => handleChange(name, "name")}
                                    style={styles.input}
                                />
                                <HelperText type={input.name.length > 0 ? "info" : "error"}>
                                    {input.name.length > 0
                                        ? "Será visible para los demás jugadores"
                                        : "Completa el campo para comenzar el juego"}
                                </HelperText>

                                <Button
                                    mode="contained"
                                    loading={loading}
                                    disabled={loading ? true : input.name.length > 0 ? false : true}
                                    onPress={() => handleSubmit()}
                                    style={{ marginTop: 15 }}
                                >
                                    Jugar
                                </Button>
                            </View>

                            <StatusBar style="light" />
                        </>
                    ) : playForm === "join" ? (
                        <>
                            <Appbar.Header>
                                <Appbar.BackAction onPress={() => setPlayForm(false)} />
                                <Appbar.Content title="Unirse a sala" />
                            </Appbar.Header>
                            <View style={styles.container}>
                                <TextInput
                                    label="Nombre"
                                    autoComplete="name"
                                    mode="outlined"
                                    error={input.name.length > 0 ? false : true}
                                    value={input.name}
                                    onChangeText={(name) => handleChange(name, "name")}
                                    style={styles.input}
                                />
                                <HelperText type={input.name.length > 0 ? "info" : "error"}>
                                    {input.name.length > 0
                                        ? "Será visible para los demás jugadores"
                                        : "Completa el campo para comenzar el juego"}
                                </HelperText>

                                <TextInput
                                    label="Código de la sala"
                                    autoComplete="off"
                                    mode="outlined"
                                    error={input.room.length > 0 ? false : true}
                                    value={input.room}
                                    onChangeText={(room) => handleChange(room, "room")}
                                    style={styles.input}
                                />
                                <HelperText type={input.room.length > 0 ? "info" : "error"}>
                                    {input.room.length > 0 ? "" : "Completa el campo para comenzar el juego"}
                                </HelperText>

                                <Button
                                    mode="contained"
                                    loading={loading}
                                    disabled={
                                        loading ? true : input.name.length > 0 && input.room.length > 0 ? false : true
                                    }
                                    onPress={() => handleSubmit()}
                                    style={{ marginTop: 15 }}
                                >
                                    Jugar
                                </Button>
                            </View>

                            <StatusBar style="light" />
                        </>
                    ) : (
                        <>
                            <Appbar.Header>
                                <Appbar.BackAction onPress={() => setPlay(false)} />
                                <Appbar.Content title="Jugar" />
                            </Appbar.Header>
                            <View style={styles.container}>
                                <Button style={{ marginBottom: 15 }} mode="contained" onPress={() => playFormCreate()}>
                                    Crear Sala
                                </Button>
                                <Button mode="contained" onPress={() => setPlayForm("join")}>
                                    Unirse
                                </Button>

                                <StatusBar style="light" />
                            </View>
                        </>
                    )}
                </>
            ) : (
                <View style={styles.container}>
                    <FAB
                        style={{ position: "absolute", top: "10%" }}
                        small
                        icon={isDark ? "white-balance-sunny" : "weather-night"}
                        onPress={() => changeTheme()}
                        color={isDark ? "black" : "white"}
                    />
                    <Button style={{ marginBottom: 15 }} mode="contained" onPress={() => setPlay(true)}>
                        Jugar
                    </Button>
                    <Button mode="contained" onPress={() => navigation.navigate("NewQuestion")}>
                        Añadir Preguntas
                    </Button>

                    <StatusBar style={isDark ? "light" : "dark"} />
                </View>
            )}

            <Portal>
                <Dialog visible={roomNoExist} onDismiss={() => setRoomNoExist(false)}>
                    <Dialog.Title>La sala no existe</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>
                            Prueba ingresando el código de la sala nuevamente respetando las mayúsculas y minúsculas o
                            crea una sala nueva
                        </Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setRoomNoExist(false)}>Aceptar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </PaperProvider>
    );
}
