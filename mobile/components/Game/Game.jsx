import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { Button, FAB, Provider as PaperProvider } from "react-native-paper";
import { lightTheme, darkTheme } from "../Home/Home";

export default function Game({ navigation }) {
    useEffect(() => {
        getTheme();
    }, []);

    const [isDark, setIsDark] = useState(false);

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? "#121212" : "#fff",
            alignItems: "center",
            justifyContent: "center",
        },
    });

    return (
        <PaperProvider theme={isDark ? darkTheme : lightTheme}>
            <View style={styles.container}>
                <Text>Jugar</Text>
                <StatusBar style={isDark ? "light" : "dark"} />
            </View>
        </PaperProvider>
    );
}
