import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { getNetworkStateAsync } from "expo-network";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import NewQuestion from "./components/NewQuestion/NewQuestion";

const isConnected = (async () => {
    const res = await getNetworkStateAsync();
    res.isConnected === true ? console.log("Hay internet") : console.log("No hay internet");
})();

const Stack = createNativeStackNavigator();
export default function App() {
    return (
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
    );
}
