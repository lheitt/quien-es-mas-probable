import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Button, FAB, DefaultTheme, DarkTheme, Provider as PaperProvider } from "react-native-paper";

export default function App() {
    useEffect(() => {
        getTheme();
    }, []);

    const [isDark, setIsDark] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#fff",
            alignItems: "center",
            justifyContent: "center",
        },
    });

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    const changeTheme = async () => {
        setIsDark(!isDark);
        await AsyncStorage.setItem("theme", isDark ? "light" : "dark");
    };

    return (
        <PaperProvider theme={isDark ? DefaultTheme : DarkTheme}>
            <View style={styles.container}>
                <FAB
                    style={styles.fab}
                    small
                    icon={isDark ? "white-balance-sunny" : "weather-night"}
                    onPress={() => changeTheme()}
                />
                <Button mode="contained" onPress={() => console.log("Jugar")}>
                    Jugar
                </Button>
                <Button mode="contained" onPress={() => console.log("Añadir preguntas")}>
                    Añadir Preguntas
                </Button>
                <StatusBar style={isDark ? "light" : "dark"} />
            </View>
        </PaperProvider>
    );
}
