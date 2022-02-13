import AsyncStorage from "@react-native-async-storage/async-storage";
import { socket } from "../Home/Home";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { setString } from "expo-clipboard";
import { StyleSheet, View} from "react-native";
import {
    ActivityIndicator,
    Button,
    Dialog,
    FAB,
    Paragraph,
    Portal,
    Title,
    Caption,
    Subheading,
    Provider as PaperProvider,
} from "react-native-paper";
import { lightTheme, darkTheme } from "../Home/Home";
import { ENDPOINT } from "../Home/Home";
import axios from "axios";

export default function Game({ navigation, route }) {
    useEffect(() => {
        getTheme();

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

    const { room } = route.params;
    const [isDark, setIsDark] = useState(false);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [renderedQuestion, setRenderedQuestion] = useState(null);
    const [selectedUser, setSelectedUser] = useState(undefined);
    const [username, setUsername] = useState("");
    const [nextQuestionEnabled, setNextQuestionEnabled] = useState(true);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    const getQuestions = async (roomUser) => {
        const res = await axios.post(`${ENDPOINT}/questions-server`, { serverCode: roomUser });
        setQuestions(res.data);
    };

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
        navigation.navigate("Home");
    };

    const handleSubmit = (e) => {
        // setRenderedQuestion(Math.round(Math.random() * (questions.length - 1)));
        if (renderedQuestion === null || renderedQuestion === questions.length - 1) {
            socket.emit("renderedQuestionServer", { renderedQuestion: 0, room: room });
            return;
        }
        socket.emit("renderedQuestionServer", { renderedQuestion: renderedQuestion + 1, room: room });
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
            <View style={styles.container}>
                <Button
                    style={{ position: "absolute", top: "10%", left: "60%" }}
                    icon="content-copy"
                    uppercase={false}
                    onPress={() => setString(room)}
                >
                    SALA: {room}
                </Button>

                <FAB
                    style={{ position: "absolute", top: "10%", left: "10%" }}
                    small
                    icon="home"
                    onPress={() => setOpen(true)}
                    color={isDark ? "black" : "white"}
                />

                {showResults ? (
                    <View style={{ marginBottom: 15 }}>
                        {results.map((user, key) => (
                            <Subheading key={key} style={{ textAlign: "center" }}>
                                {user.username === username && user.selectedUser === username
                                    ? `Te votaste a ti mismo`
                                    : user.username === username
                                    ? `Votaste a ${user.selectedUser}`
                                    : user.selectedUser === username
                                    ? `${user.username} te votó`
                                    : user.username === user.selectedUser
                                    ? `${user.username} se votó a sí mismo`
                                    : `${user.username} votó a ${user.selectedUser}`}
                            </Subheading>
                        ))}
                    </View>
                ) : (
                    <>
                        {users.length !== 0 ? (
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 40,
                                }}
                            >
                                {users.map((user, key) => (
                                    <View
                                        key={key}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flexWrap: "wrap",
                                            margin: 15,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <Button
                                            mode="contained"
                                            color={
                                                selectedUser === key
                                                    ? isDark
                                                        ? darkTheme.colors.sucess
                                                        : lightTheme.colors.sucess
                                                    : isDark
                                                    ? darkTheme.colors.error
                                                    : lightTheme.colors.error
                                            }
                                            labelStyle={{ fontSize: 25 }}
                                            onPress={() => userButtonPressed(key)}
                                        >
                                            {user.name}
                                        </Button>

                                        {renderedQuestion === null ? (
                                            <></>
                                        ) : user.vote === true ? (
                                            <></>
                                        ) : (
                                            <Caption
                                                style={{
                                                    color: isDark ? "#fff" : "#000",
                                                    position: "absolute",
                                                    top: "38%",
                                                }}
                                            >
                                                {user.name === username ? "NO VOTASTE" : "NO VOTÓ"}
                                            </Caption>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <></>
                        )}
                    </>
                )}

                {questions.length !== 0 ? (
                    <>
                        {renderedQuestion !== null ? (
                            <>
                                <Title
                                    style={{
                                        textAlign: "center",
                                        marginBottom: questions[renderedQuestion].addedBy !== "Default" ? 5 : 15,
                                    }}
                                >
                                    {questions[renderedQuestion].question}
                                </Title>
                                {questions[renderedQuestion].addedBy !== "Default" ? (
                                    <Paragraph
                                        style={{ textAlign: "center", marginBottom: 20 }}
                                    >{`(añadida por ${questions[renderedQuestion].addedBy})`}</Paragraph>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}

                        <Button
                            disabled={!nextQuestionEnabled && renderedQuestion !== null}
                            mode="contained"
                            onPress={handleSubmit}
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
                            <Caption style={{ color: isDark ? "#fff" : "#000" }}>{`${renderedQuestion + 1}/${
                                questions.length
                            }`}</Caption>
                        ) : (
                            <></>
                        )}
                    </>
                ) : (
                    <ActivityIndicator animating={true} color={isDark ? "#90caf9" : "#1976d2"} />
                )}

                <Portal>
                    <Dialog visible={open} onDismiss={() => setOpen(false)}>
                        <Dialog.Title>¿Volver al menú?</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Te saldrás de la sala actual</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setOpen(false)}>Cancelar</Button>
                            <Button onPress={() => homeButtonPressed()}>Salir</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <StatusBar style={isDark ? "light" : "dark"} />
            </View>
        </PaperProvider>
    );
}
