import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { getNetworkStateAsync } from "expo-network";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import NewQuestion from "./components/NewQuestion/NewQuestion";
import { BackHandler } from "react-native";
import { lightTheme, darkTheme } from "./components/Home/Home";
import { Button, Dialog, Paragraph, Portal, Provider as PaperProvider } from "react-native-paper";

export default function App() {
    useEffect(() => {
        getTheme();
        getConnection();
    }, []);

    const Stack = createNativeStackNavigator();
    const [isDark, setIsDark] = useState(false);
    const [isConnected, setIsConnected] = useState(undefined);

    const getConnection = async () => {
        const res = await getNetworkStateAsync();
        if (res.isConnected === true) setIsConnected(true);
        else setIsConnected(false);
    };

    const getTheme = async () => {
        const themeSelected = await AsyncStorage.getItem("theme");
        themeSelected === "dark" ? setIsDark(true) : setIsDark(false);
    };

    return (
        <>
            {isConnected === undefined ? (
                <></>
            ) : isConnected ? (
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen name="Game" component={Game} />
                        <Stack.Screen name="NewQuestion" component={NewQuestion} />
                    </Stack.Navigator>
                </NavigationContainer>
            ) : (
                <PaperProvider theme={isDark ? darkTheme : lightTheme}>
                    <Portal>
                        <Dialog visible onDismiss={() => BackHandler.exitApp()}>
                            <Dialog.Title>Sin conexi??n a internet</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>
                                    Para jugar se necesita una conexion de internet activa, salga de la app y vuelva a
                                    intentarlo
                                </Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => BackHandler.exitApp()}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </PaperProvider>
            )}
        </>
    );
}
