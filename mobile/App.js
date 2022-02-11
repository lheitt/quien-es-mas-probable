import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Button, FAB, DefaultTheme, DarkTheme, Provider as PaperProvider } from "react-native-paper";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import NewQuestion from "./components/NewQuestion/NewQuestion";
import GameMode from "./components/Home/GameMode";
import CreateGame from "./components/Home/CreateGame";
import JoinGame from "./components/Home/JoinGame";

const Stack = createNativeStackNavigator();
export default function App() {
    return (
        <PaperProvider theme={DarkTheme}>
            <NavigationContainer theme={DarkTheme}>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                    <Stack.Screen name="GameMode" component={GameMode} options={{ title: "Crear Sala o Unirse" }} />
                    <Stack.Screen name="CreateGame" component={CreateGame} options={{ title: "Crear Sala" }} />
                    <Stack.Screen name="JoinGame" component={JoinGame} options={{ title: "Unirse a Sala" }} />
                    <Stack.Screen name="Game" component={Game} options={{ headerShown: false }} />
                    <Stack.Screen name="NewQuestion" component={NewQuestion} options={{ title: "Nueva Pregunta" }} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
