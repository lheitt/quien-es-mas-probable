import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Button, FAB, DefaultTheme, DarkTheme, Appbar, Provider as PaperProvider } from "react-native-paper";
import axios from "axios";

export const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#1976d2",
        accent: "#1976d2",
        error: "#d32f2f",
    },
};

export const darkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: "#90caf9",
        accent: "#90caf9",
        error: "#f44336",
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
            // if (playForm === "create") roomCode = codeGenerator(5);
            // else roomCode = input.room;

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
                // if (playForm === "join") {
                //     socket.emit("roomExist", roomCode, (noExist) => {
                //         if (noExist) {
                //             setLoading(false);
                //             setInput({
                //                 ...input,
                //                 room: "",
                //             });
                //             socket.disconnect();
                //             setRoomNoExist(true);
                //         } else {
                //             setLoading(false);
                //             socket.emit("newUser", {
                //                 name: input.name,
                //                 socketId: socket.id,
                //                 room: roomCode,
                //             });
                //             navigate(`/game/${roomCode}`);
                //         }
                //     });
                // } else {
                //     socket.emit("newUser", {
                //         name: input.name,
                //         socketId: socket.id,
                //         room: roomCode,
                //         maxQuestions: input.maxQuestions,
                //     });
                //     navigate(`/game/${roomCode}`);
                // }
                console.log("Me conecte");
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
                            <View style={styles.container}></View>

                            <StatusBar style="light" />
                        </>
                    ) : playForm === "join" ? (
                        <>
                            <Appbar.Header>
                                <Appbar.BackAction onPress={() => setPlayForm(false)} />
                                <Appbar.Content title="Unirse a sala" />
                            </Appbar.Header>
                            <View style={styles.container}></View>

                            <StatusBar style="light" />
                        </>
                    ) : (
                        <>
                            <Appbar.Header>
                                <Appbar.BackAction onPress={() => setPlay(false)} />
                                <Appbar.Content title="Jugar" />
                            </Appbar.Header>
                            <View style={styles.container}>
                                <Button
                                    style={{ marginBottom: 15 }}
                                    mode="contained"
                                    onPress={() => setPlayForm("create")}
                                >
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
        </PaperProvider>
    );
}
